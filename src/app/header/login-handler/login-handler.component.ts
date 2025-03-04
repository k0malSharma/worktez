import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/app/Interface/UserInterface';
import { AuthService } from 'src/app/services/auth.service';
import { BackendService } from 'src/app/services/backend/backend.service';

@Component({
  selector: 'app-login-handler',
  templateUrl: './login-handler.component.html',
  styleUrls: ['./login-handler.component.css']
})
export class LoginHandlerComponent implements OnInit {
  user: User

  organizationAvailable: boolean = false;
  constructor(public authService: AuthService, public router: Router, public backendService: BackendService) { }

  ngOnInit(): void {
    this.authService.afauth.user.subscribe((action) => {
      this.authService.completedLoadingApplication = false;
      const data = action as User;
      if(data) {
        this.user = data
        this.authService.user = data;
        this.authService.getUserSettings(); 
      } else {
        this.authService.completedLoadingApplication = true;
      }
    }, (error) => {
      this.authService.completedLoadingApplication = true;
      console.log(error);
    });
  }

}
