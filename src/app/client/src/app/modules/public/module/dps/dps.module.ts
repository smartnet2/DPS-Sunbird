import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TelemetryModule } from '@sunbird/telemetry';
import { CoreModule } from '@sunbird/core';
import { SharedModule } from '@sunbird/shared';
import { NgInviewModule } from 'angular-inport';
import { EmailInputComponent } from './common/components/email-input/email-input.component';
import { WriteEmailService } from './common/services/email-input/email-input.service';
import { EmailService } from './common/services/email/email.service';
import { DataService } from '../../../core/services/data/data.service';
import { DPSDashboardComponent } from './components';
@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    TelemetryModule,
    CoreModule,
    SharedModule,
    NgInviewModule
  ],
  declarations: [DPSDashboardComponent, EmailInputComponent],
  providers: [DataService, EmailService, WriteEmailService]
})
export class DPSModule { }
