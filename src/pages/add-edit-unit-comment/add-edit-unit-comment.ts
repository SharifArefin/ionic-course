import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ConfigService } from '../../services/config';
import { NotesDiscussionService } from "../../services/notes_discussions";  

import { FormGroup,FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'page-add-edit-unit-comment',
  templateUrl: 'add-edit-unit-comment.html',
})
export class AddEditUnitCommentPage  {
 
	comment:any=0;
  eComment:string="";
	type:string='new';
	comment_id:number=0;
	unit_id:any=0;
	commentForm: FormGroup;
	postcomment:any={};
  	constructor(public navCtrl: NavController, public navParams: NavParams,
  	private notesanddiscussion:NotesDiscussionService,private config:ConfigService) {
  		this.postcomment={
	 		'comment_date':1,
	 		'user_id':null,
	 		'comment_post_ID':0,
	 		'comment_content':0,
	 	};
  	}

  	ngOnInit(){
  		this.comment = this.navParams.data.comment;
      this.eComment=this.navParams.data.comment.comment_content;
  		this.type = this.navParams.data.type;

  		this.unit_id = this.navParams.data.unit_id;

  		if(this.comment){
  			this.comment_id=this.comment.comment_ID;
        
  			this.postcomment.comment_date = this.comment.comment_date;	
  			this.postcomment.user_id = this.comment.user_id;	
  			this.postcomment.comment_post_ID = this.comment.comment_post_ID;
  			this.postcomment.comment_content = this.comment.comment_content;	
        this.postcomment.user = this.config.user;
  		}else{
  			this.comment_id =0;
  			this.postcomment.comment_date = '';
  			this.postcomment.user_id=this.config.user.id;
  			this.postcomment.comment_post_ID = this.unit_id;
        this.postcomment.user = this.config.user;
  		}

      console.log(this.postcomment);
  		this.initializeForm();
	}

	private initializeForm(){
       if(this.type=="edit"){
        
      	this.commentForm = new FormGroup({
      		'comment_content': new FormControl(this.eComment,Validators.required),
      	});
      }
      else{
        
          this.commentForm = new FormGroup({
          'comment_content': new FormControl(null,Validators.required),
        });
      }
    } 

  	onSubmit(){
    
  		this.postcomment.comment_content = this.commentForm.value.comment_content;  
  		this.notesanddiscussion.addEditCommentPage(this.comment_id,this.type,this.postcomment);
      this.navCtrl.pop();
  }


}
