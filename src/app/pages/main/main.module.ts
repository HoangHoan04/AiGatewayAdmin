import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NzTabsModule } from "ng-zorro-antd/tabs";
import { SharedModule } from "../../shared/shared.module";
import { DashboardComponent } from "./dashboard/dashboard.component";

const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent },
];

@NgModule({
  declarations: [DashboardComponent],
  imports: [SharedModule, NzTabsModule, RouterModule.forChild(routes)],
})
export class MainModule {}
