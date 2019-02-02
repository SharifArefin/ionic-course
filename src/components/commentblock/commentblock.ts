import { Component , Input, OnInit, Output, EventEmitter  } from '@angular/core';
import { NotesDiscussionService } from "../../services/notes_discussions";

import { AlertController, NavController, NavParams  } from 'ionic-angular';
import { ConfigService } from '../../services/config';

import {FriendlytimeComponent} from '../friendlytime/friendlytime';

import { AddEditUnitCommentPage } from '../../pages/add-edit-unit-comment/add-edit-unit-comment';

@Component({
  selector: 'CommentBlock',
  templateUrl: 'commentblock.html'
})
export class CommentBlock implements OnInit   {

	public unit_id:number;
	public current_user_id:number;
	time:number =0;
	show_hide:number=1;
	add_edit_reply:number=0;
	@Input('comment') comment;
	public childs:Array<any>;	
	 
		constructor( public navCtrl: NavController,
					 public alertCtrl:AlertController,
		 	       	 public notesanddiscussion:NotesDiscussionService,
		 	       	 private config:ConfigService

	 	) {
	 		


	  	}

	  	manageChildren(){
	  		if(this.show_hide){
	  			this.show_hide=0;
	  		}else{
	  			this.show_hide=1;
	  		}
	  	}

        ngOnInit(){
	 		
	 		if(this.comment.user_id == this.config.user.id){
	 			this.comment['user']=this.config.user;
	 		}

	 		this.time = Math.floor(new Date().getTime()/1000) - this.comment.comment_date;

	 		if(!this.comment.hasOwnProperty('comment_date')){
	 			this.comment['comment_date']= (new Date().getTime()/1000);
	 			this.time = 0;
	 		}
		 //    let t = this.comment.comment_date.split(/[- :]/);
			// this.time = (new Date().getTime() - new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5])).getTime())/1000;
			// console.log(this.time);
	    }

	    addReply(){
	    	console.log(this.comment);
    		this.navCtrl.push(AddEditUnitCommentPage,{'comment':this.comment,'type':'reply'});
	    }

	    editReply(){
	    	
	    	this.navCtrl.push(AddEditUnitCommentPage,{'comment':this.comment,'type':'edit'});
	    }

 		getClass(){
 			if(this.config.user.id === this.comment.user_id){
 				return 'comment_author mine'
 			}else{
 				return 'comment_author'
 			}
 		}

		    

}
