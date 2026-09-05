import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NzTabsModule } from "ng-zorro-antd/tabs";
import { SharedModule } from "../../shared/shared.module";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ModelsComponent } from "./models/models.component";
import { PlaygroundComponent } from "./playground/playground.component";
import { ProjectsComponent } from "./projects/projects.component";
import { ProvidersComponent } from "./providers/providers.component";
import { TemplatesComponent } from "./templates/templates.component";
import { UsageLogsComponent } from "./usage-logs/usage-logs.component";

const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent },
  { path: "providers", component: ProvidersComponent },
  { path: "models", component: ModelsComponent },
  { path: "projects", component: ProjectsComponent },
  { path: "templates", component: TemplatesComponent },
  { path: "playground", component: PlaygroundComponent },
  { path: "usage-logs", component: UsageLogsComponent },
];

@NgModule({
  declarations: [
    DashboardComponent,
    ProvidersComponent,
    ModelsComponent,
    ProjectsComponent,
    TemplatesComponent,
    PlaygroundComponent,
    UsageLogsComponent,
  ],
  imports: [SharedModule, NzTabsModule, RouterModule.forChild(routes)],
})
export class MainModule {}
