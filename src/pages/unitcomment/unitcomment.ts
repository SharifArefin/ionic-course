import { Component,OnInit } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { NavController, NavParams, ModalController,LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup,FormControl, Validators, } from '@angular/forms';
import { NotesDiscussionService } from "../../services/notes_discussions"; 
import { ConfigService } from '../../services/config';
import { Observable } from 'rxjs/Observable';
import { Chart } from 'chart.js';

import { AddEditUnitCommentPage } from '../../pages/add-edit-unit-comment/add-edit-unit-comment';

@Component({
  selector: 'page-unitcomment',
  templateUrl: 'unitcomment.html',
})
export class UnitCommentPage implements OnInit {
	
	public unit_id:number;
	public comments:Array<any>=[];	
	public loading: number = 1;
	public paged:number=0;
	public res_check:boolean=true;
	
	private noMoreCommentsAvailable:boolean = false;

		constructor(public navCtrl: NavController,
		   public navParams: NavParams,		
       	   private notes:NotesDiscussionService,
       	   public notesanddiscussion:NotesDiscussionService,
       	   public alertCtrl:AlertController,
       	   private loadingCtrl:LoadingController,
       	   private config:ConfigService) {
		   console.log('constructor unit comment page');

		}


	    ngOnInit(){ 
		  	this.unit_id=this.navParams.data; 
		  	
		   	if(this.paged <= 1){     
		  		this.notesanddiscussion.getComments(this.unit_id).subscribe(res=>{    // give here per page
	                if(res){
	                	
	                	//this.comments = this.notesanddiscussion.comments;
	                	if(this.notesanddiscussion.paged === 0 || !this.notesanddiscussion.comments.length){
	                		this.noMoreCommentsAvailable=true;
	                	}else{
	                		this.paged = this.notesanddiscussion.paged;
	                	}
	                }
	          	});
		   	}   
	    }  

	    formatComments(comments){
	    	this.comments = comments;
	    	let comments_tree =[];
	    	this.comments.map((comment,i)=>{
	    		let c=this.recursiveFormat(comment);	
	    		comments_tree.push(c); 
	    	});

	    	return comments_tree;
	    }

	    recursiveFormat(comment){
	    	this.comments.map((c,i)=>{

	    		
	    		if(parseInt(comment.comment_ID) === parseInt(c.comment_parent)){
	    			

	    			if(!comment.hasOwnProperty('child')){
	    				comment['child']=[];
	    			}
	    			
	    			this.comments.splice(i,1);
	    			comment.child.push(this.recursiveFormat(c));
	    		}
	    	});
	    	return comment;
	    }
		/*infiniteload(){
		  	this.unit_id=this.navParams.data;  
		  	console.log(this.unit_id);
		  	console.log('below unit id and above res check');  

	      	this.notesanddiscussion.getCommentPerPage(this.unit_id,this.notesanddiscussion.page_number);
	        console.log('res_check');
	        console.log(this.res_check);
          	this.notesanddiscussion.page_number++;
		}*/

		showCommentForm() {
		    this.navCtrl.push(AddEditUnitCommentPage,{'comment':0,'unit_id':this.unit_id,'type':'new'});
	    }


	    doRefresh(refresher){
	    	
	    	this.notesanddiscussion.getComments(this.unit_id,0).subscribe(res=>{    // give here per page
	    		this.paged = this.notesanddiscussion.paged;
                refresher.complete();
          	});
	    	
	    }

	    loadMoreComments(loaded){

	    	this.notesanddiscussion.getComments(this.unit_id,this.paged).subscribe(res=>{    // give here per page
	    		if(res){

	    			console.log(this.notesanddiscussion.paged+'  vs '+this.paged);
	    			if(this.paged === this.notesanddiscussion.paged){
	    				this.noMoreCommentsAvailable = true;	    			
	    			}else{
	    				this.paged = this.notesanddiscussion.paged;	
	    			}
	    			
	    		}else{
	    			this.noMoreCommentsAvailable = true;	    			
	    		}
                loaded.complete();
          	});

	    	

	    }

}
