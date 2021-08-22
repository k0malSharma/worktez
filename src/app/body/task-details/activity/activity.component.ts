import { Component, Input, OnInit } from '@angular/core';
import { Activity } from 'src/app/Interface/ActivityInterface';
import { User, UserAppSetting} from "../../../Interface/UserInterface";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'


@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {

  @Input('activity') activity: Activity

  public userObservable: Observable<UserAppSetting>;
  public userDocument: AngularFirestoreDocument<UserAppSetting>;

  user: UserAppSetting;
  

  constructor(private db: AngularFirestore) { }

  ngOnInit(): void {
    console.log(this.activity.Uid);
    this.getUserDetail();
  }

  getUserDetail() {
    console.log(1);
    var documentName = "Users/"+this.activity.Uid;
    console.log(1);
    this.userDocument = this.db.doc<UserAppSetting>(documentName);
    console.log(1);
    this.userObservable = this.userDocument.snapshotChanges().pipe(
      map(actions => {
        console.log(2);
        const data = actions.payload.data() as UserAppSetting;
        this.user = data;
        console.log(data);
        return { ...data }
      }));
      // await this.db.collection('Users').doc(this.activity.Uid).get().toPromise().then(function (doc){
      //   const data =doc.data() as User;
      //   this.user = data;
      //   console.log(this.user);
      // })
  }

}
