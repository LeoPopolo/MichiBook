import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProfileComponent } from './home/components/profile/profile.component';
import { PostsComponent } from './home/components/posts/posts.component';
import { FriendsComponent } from './home/components/friends/friends.component';
import { HomeComponent } from './home/home.component';
import { UserHeaderComponent } from './shared/userHeader/user-header.component';
import { PostComponent } from './home/components/posts/post/post.component';
import { MaterialModule } from '../shared/material.module';
import { RequestsComponent } from './home/components/friends/requests/requests.component';

@NgModule({
  declarations: [
    PagesComponent,
    NavbarComponent,
    ProfileComponent,
    PostsComponent,
    FriendsComponent,
    HomeComponent,
    UserHeaderComponent,
    PostComponent,
    RequestsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PagesRoutingModule,
    MaterialModule
  ],
  providers: []
})
export class PagesModule {
}
