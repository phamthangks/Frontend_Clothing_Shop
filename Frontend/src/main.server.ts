import { bootstrapApplication } from '@angular/platform-browser';
import { config } from './app/app.config.server';
import { HomeComponent } from './app/components/home/home.component';
import { LayoutsComponent } from './app/components/layouts/layouts.component';
import { AppComponent } from './app/app/app.component';
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
