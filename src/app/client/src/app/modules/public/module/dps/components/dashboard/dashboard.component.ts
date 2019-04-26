import { combineLatest as observableCombineLatest, Subject } from 'rxjs';
import { PageApiService, PlayerService, ISort, OrgDetailsService } from '@sunbird/core';
import { PublicPlayerService } from '../../../../services';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import {
  ResourceService, ToasterService, INoResultMessage,
  ConfigService, UtilService, NavigationHelperService
} from '@sunbird/shared';
import { ICaraouselData } from '@sunbird/shared';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { IInteractEventEdata, IImpressionEventInput } from '@sunbird/telemetry';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [
    './dashboard.component.css',
  ],
  encapsulation: ViewEncapsulation.None
})
export class DPSDashboardComponent implements OnInit, OnDestroy {
  /**
   * To show toaster(error, success etc) after any API calls
   */
  private toasterService: ToasterService;
  /**
   * 
   * 
   * To call resource service which helps to use language constant
   */
  public resourceService: ResourceService;
  /**
  * To call get resource data.
  */
  private pageSectionService: PageApiService;

  public orgDetailsService: OrgDetailsService;
  /**
   * This variable hepls to show and hide page loader.
   * It is kept true by default as at first when we comes
   * to a page the loader should be displayed before showing
   * any data
   */
  showLoader = true;
  /**
  * To show / hide no result message when no result found
 */
  noResult = false;
  /**
  * no result  message
 */
  noResultMessage: INoResultMessage;
  /**
  * Contains result object returned from getPageData API.
  */
  inspiredCarouselData: Array<ICaraouselData> = [];
  opportunitiesCarouselData: Array<ICaraouselData> = [];
  booksCarouselData: Array<ICaraouselData> = [];
  public config: ConfigService;
  public filterType: string;
  public filters: any;
  public queryParams: any;
  private router: Router;
  public redirectUrl: string;
  sortingOptions: Array<ISort>;
  contents: any;
  hashTagId: string;
  slug = '';
  isSearchable = false;
  public unsubscribe$ = new Subject<void>();
  telemetryImpression: IImpressionEventInput;
  inviewLogs = [];
  filterIntractEdata: IInteractEventEdata;
  sortIntractEdata: IInteractEventEdata;
  /**
   * The "constructor"
   *
   * @param {PageApiService} pageSectionService Reference of pageSectionService.
   * @param {ToasterService} iziToast Reference of toasterService.
   */
  constructor(pageSectionService: PageApiService, toasterService: ToasterService, private playerService: PlayerService,
    resourceService: ResourceService, config: ConfigService, private activatedRoute: ActivatedRoute, router: Router,
    public utilService: UtilService, public navigationHelperService: NavigationHelperService,
    orgDetailsService: OrgDetailsService, private publicPlayerService: PublicPlayerService) {
    this.pageSectionService = pageSectionService;
    this.toasterService = toasterService;
    this.resourceService = resourceService;
    this.orgDetailsService = orgDetailsService;
    this.config = config;
    this.router = router;
    this.router.onSameUrlNavigation = 'reload';
    this.sortingOptions = this.config.dropDownConfig.FILTER.RESOURCES.sortingOptions;
  }

  populatePageData() {
    this.showLoader = true;
    this.noResult = false;
    const option = {
      source: 'web',
      name: 'Explore',
      filters: _.pickBy(this.filters, value => value.length > 0),
      sort_by: { [this.queryParams.sort_by]: this.queryParams.sortType }
    };
    this.pageSectionService.getPageData(option).pipe(
      takeUntil(this.unsubscribe$))
      .subscribe(
        (apiResponse) => {
          if (apiResponse && apiResponse.sections) {
            let noResultCounter = 0;
            this.showLoader = false;
            this.booksCarouselData = _.cloneDeep([apiResponse.sections[0]]);
            this.inspiredCarouselData = _.cloneDeep([apiResponse.sections[1]]);
            this.opportunitiesCarouselData = _.cloneDeep([apiResponse.sections[2]]);
            _.forEach(this.booksCarouselData, (value, index) => {
              if (this.booksCarouselData[index].contents && this.booksCarouselData[index].contents.length > 0) {
                const constantData = this.config.appConfig.ExplorePage.constantData;
                const metaData = this.config.appConfig.ExplorePage.metaData;
                const dynamicFields = this.config.appConfig.ExplorePage.dynamicFields;
                this.booksCarouselData[index].contents = this.utilService.getDataForCard(this.booksCarouselData[index].contents,
                  constantData, dynamicFields, metaData);
              }
            });
            _.forEach(this.inspiredCarouselData, (value, index) => {
              if (this.inspiredCarouselData[index].contents && this.inspiredCarouselData[index].contents.length > 0) {
                const constantData = this.config.appConfig.ExplorePage.constantData;
                const metaData = this.config.appConfig.ExplorePage.metaData;
                const dynamicFields = this.config.appConfig.ExplorePage.dynamicFields;
                this.inspiredCarouselData[index].contents = this.utilService.getDataForCard(this.inspiredCarouselData[index].contents,
                  constantData, dynamicFields, metaData);
              }
            });
            _.forEach(this.opportunitiesCarouselData, (value, index) => {
              if (this.opportunitiesCarouselData[index].contents && this.opportunitiesCarouselData[index].contents.length > 0) {
                const constantData = this.config.appConfig.ExplorePage.constantData;
                const metaData = this.config.appConfig.ExplorePage.metaData;
                const dynamicFields = this.config.appConfig.ExplorePage.dynamicFields;
                this.opportunitiesCarouselData[index].contents = this.utilService.getDataForCard(this.opportunitiesCarouselData[index].contents,
                  constantData, dynamicFields, metaData);
              }
            });
            if (this.booksCarouselData.length > 0) {
              _.forIn(this.booksCarouselData, (value, key) => {
                if (this.booksCarouselData[key].contents === null) {
                  noResultCounter++;
                } else if (this.booksCarouselData[key].contents === undefined) {
                  noResultCounter++;
                }
              });
            }
            if (noResultCounter === this.booksCarouselData.length) {
              this.noResult = true;
              this.noResultMessage = {
                'message': this.resourceService.messages.stmsg.m0007,
                'messageText': this.resourceService.messages.stmsg.m0006
              };
            }
          }
        },
        err => {
          this.noResult = true;
          this.noResultMessage = {
            'message': this.resourceService.messages.stmsg.m0007,
            'messageText': this.resourceService.messages.stmsg.m0006
          };
          this.showLoader = false;
          this.toasterService.error(this.resourceService.messages.fmsg.m0004);
        }
      );
  }

  ngOnInit() {
    this.slug = this.activatedRoute.snapshot.params.slug;
    this.filterType = this.config.appConfig.explore.filterType;
    this.redirectUrl = this.config.appConfig.explore.inPageredirectUrl;
    this.getQueryParams();
    this.getChannelId();
    this.telemetryImpression = {
      context: {
        env: this.activatedRoute.snapshot.data.telemetry.env
      },
      edata: {
        type: this.activatedRoute.snapshot.data.telemetry.type,
        pageid: this.activatedRoute.snapshot.data.telemetry.pageid,
        uri: this.router.url,
        subtype: this.activatedRoute.snapshot.data.telemetry.subtype
      }
    };
    this.filterIntractEdata = {
      id: 'filter',
      type: 'click',
      pageid: this.activatedRoute.snapshot.data.telemetry.pageid
    };
    this.sortIntractEdata = {
      id: 'sort',
      type: 'click',
      pageid: this.activatedRoute.snapshot.data.telemetry.pageid
    };
    var self=this;
    $(function () {
      (<any>$('#side-menu')).metisMenu();
      // $(window).bind("load resize", function () {
      //   var topOffset = 50;
      //   var width = (self.window.innerWidth > 0) ? self.window.innerWidth : self.screen.width;
      //   if (width < 768) {
      //     $('div.navbar-collapse').addClass('collapse');
      //     topOffset = 100; // 2-row-menu
      //   } else {
      //     $('div.navbar-collapse').removeClass('collapse');
      //   }

      //   var height = ((self.window.innerHeight > 0) ? self.window.innerHeight : self.screen.height) - 1;
      //   height = height - topOffset;
      //   if (height < 1) height = 1;
      //   if (height > topOffset) {
      //     $("#page-wrapper").css("min-height", (height) + "px");
      //   }
      // });

      // var url = window.location;
      // var self=this;
      // var element = $('ul.nav a').filter(function () {
      //   return self.href == url || url.href.indexOf(self.href) == 0;
      // }).addClass('active').parent().parent().addClass('in').parent();
      // if (element.is('li')) {
      //   element.addClass('active');
      // }

    });
  }



  prepareVisits(event) {
    _.forEach(event, (inview, index) => {
      if (inview.metaData.identifier) {
        this.inviewLogs.push({
          objid: inview.metaData.identifier,
          objtype: inview.metaData.contentType,
          index: index,
          section: inview.section,
        });
      }
    });
    this.telemetryImpression.edata.visits = this.inviewLogs;
    this.telemetryImpression.edata.subtype = 'pageexit';
    this.telemetryImpression = Object.assign({}, this.telemetryImpression);
  }

  public playContent(event) {
    this.publicPlayerService.playContent(event);
  }

  compareObjects(a, b) {
    if (a !== undefined) {
      a = _.omit(a, ['language']);
    }
    if (b !== undefined) {
      b = _.omit(b, ['language']);
    }
    return _.isEqual(a, b);
  }

  getQueryParams() {
    observableCombineLatest(
      this.activatedRoute.params,
      this.activatedRoute.queryParams,
      (params: any, queryParams: any) => {
        return {
          params: params,
          queryParams: queryParams
        };
      }).pipe(
        takeUntil(this.unsubscribe$))
      .subscribe(bothParams => {
        this.filters = {};
        this.isSearchable = this.compareObjects(this.queryParams, bothParams.queryParams);
        this.queryParams = { ...bothParams.queryParams };
        _.forIn(this.queryParams, (value, key) => {
          if (key !== 'sort_by' && key !== 'sortType') {
            this.filters[key] = value;
          }
        });
        this.inspiredCarouselData = [];
        this.opportunitiesCarouselData = [];
        this.booksCarouselData = [];
        if (this.queryParams.sort_by && this.queryParams.sortType) {
          this.queryParams.sortType = this.queryParams.sortType.toString();
        }
        if (!this.isSearchable) {
          this.populatePageData();
        }
      });
  }

  getChannelId() {
    this.orgDetailsService.getOrgDetails(this.slug).pipe(
      takeUntil(this.unsubscribe$))
      .subscribe(
        (apiResponse: any) => {
          this.hashTagId = apiResponse.hashTagId;
        },
        err => {
          this.router.navigate(['']);
        }
      );
  }
  redirectToUrl(path) {
    this.router.navigate([path]);
  }
  backtoPreviousPage() {
    window.history.back();
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
