import { Injectable } from '@angular/core';
// import { NavController, NavParams, ModalController,LoadingController } from 'ionic-angular';
// import { Component,OnInit } from '@angular/core';
import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Platform, ToastController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/toPromise';
import { AuthenticationService } from "./authentication";
import { ConfigService } from "./config";
import { Storage } from '@ionic/storage';
import { Comment } from "../models/comment";

@Injectable()
export class NotesDiscussionService {  

	public user:any;
	public baseUrl:string;
	public token:string;
	public commentsobservable:Observable<any>;
	public comments:any=[];
    private lastpushed:number=0;
	private observable: Observable<any>; //Tracks request in progress
	public unit_id:number;

	public paged:number=0;

	public getCommentValidate:number;     // for again enter to getCommentPage restriction
	public res_check:boolean=true;
		constructor(
	    	private http:Http,
	    	private platform : Platform,
	      	private storage: Storage,
	      	private toastCtrl: ToastController,
	      	private auth:AuthenticationService,
	      	private config:ConfigService
			){

			this.baseUrl = this.config.baseUrl; 
		}


		getComments(unit_id,force_paged = -1){

			let loaded_comments = this.config.trackComponents('comments');

			if(force_paged < 0 && typeof loaded_comments !== 'undefined' && loaded_comments.findIndex((item)=>{return item === unit_id}) >=0 ){

            	return Observable.fromPromise(this.storage.get('comments_'+unit_id).then((comments) => {

            		if(comments){
            			this.comments=comments;
            			
            			let total = 1;

            			//IDIOT reduce does not work
            			this.comments.reduce((acc,item)=>{if(parseInt(item.comment_parent) === 0){  total++; acc++;} return acc; });
            			console.log(total);
	                	this.paged = Math.floor(( total )/this.config.per_page_comment);
	                	
            		}

	                return this.comments;
	            }));

	        }else{
	        	
	        	if(force_paged>=0){
	        		this.paged =force_paged;
	        	}

	        	
				let opt = this.auth.getUserAuthorizationHeaders();
	             this.commentsobservable = this.http.get(`${this.config.baseUrl}user/unitcomments/`+unit_id+`/?page=`+this.paged+`&per_page=`+this.config.per_page_comment,opt)
	             .map(response =>{  
	                let body = response.json();
	                if(body && body.length){
	                	
	                	if(force_paged == 0){
	                		//replce on force refresh
	                		this.comments = body;
	                	}else{
	                		console.log('appending');
	                		body.map((comment)=>{
	                			console.log('#1');
	                			if(this.comments.findIndex((c)=>{ return c.comment_ID === comment.comment_ID}) < 0 ){
	                				//add only unique comments
	                				this.comments.push(comment);	
	                			}
		                	});	
	                	}
	                	
	                	let total = 1;
	                	this.comments.reduce((acc,item)=>{if(parseInt(item.comment_parent) === 0){  total++; acc++;} return acc; });

	                	
	                	this.paged = Math.floor(( total )/this.config.per_page_comment);
	                	console.log('from service '+this.paged);
	                	this.storage.set('comments_'+unit_id,this.comments);
                    	this.config.addToTracker('comments',unit_id);
                    	
	                }
	                
	                return body;
	            });
            	return this.commentsobservable;	 
            }
	    }
	    


	    parse_index_reply(comments,comment_id,new_comment){
	    	for(let i=0;i<comments.length;i++){
	    		if(comments[i].comment_ID == comment_id){
	    			if(comments[i].child && comments[i].child.length){
	    				console.log('push 1');
	    				comments[i].child.unshift(new_comment);
	    			}else{
	    				console.log('push 2');
	    				comments[i].child= [];
	    				comments[i].child.push(new_comment);
	    			}
	    		}
	    		if(comments[i].child && comments[i].child.length){
	    			this.parse_index_reply(comments[i].child,comment_id,new_comment);
	    		}

	    	}
	    }


	    parse_index_edit(comments,comment_id,new_comment){       
	    	   
    		for(let i=0;i<comments.length;i++){
	    		if(comments[i].comment_ID == comment_id){
	    				comments[i]=new_comment;
	    		}
	    		if(comments[i].child && comments[i].child.length){
	    			this.parse_index_edit(comments[i].child,comment_id,new_comment);
	    		}
	    	}
	    }

	    parse_index_edit_content(comments,comment_id,new_comment){       
	    	    
    		for(let i=0;i<comments.length;i++){
	    		if(comments[i].comment_ID == comment_id){
	    				comments[i].comment_content=new_comment.comment_content;
	    		}
	    		if(comments[i].child && comments[i].child.length){
	    			this.parse_index_edit(comments[i].child,comment_id,new_comment);
	    		}
	    	}
	    }
		

        addEditCommentPage(comment_id,type,postcomment)
        {    
        	if(postcomment.comment_content.length < 2){
        		let toast = this.toastCtrl.create({
	                message: this.config.get_translation('insufficient_content'),
	                duration: 200,
	                position: 'bottom'
	            });
	            toast.present();
        	}

        	this.addEditComments(comment_id,type,postcomment).subscribe(res=>{
			       // this.parse_index_reply(this.comments,comment_id,res.comment_data); 
		       	let toast = this.toastCtrl.create({
	                message: res.message,
	                duration: 200,
	                position: 'bottom'
	            });
	            toast.present();
		    });
        }

	    addEditComments(comment_id,type,new_comment){

	    	if(type == 'new' ){

				let opt = this.auth.getUserAuthorizationHeaders();

				let new_comment_id:number =0;
				if(this.comments.length){
					new_comment_id = (123345);	
				}else{
					new_comment_id = 1;
				}
				

		     	let comment = {comment_ID:new_comment_id,loading:true,...new_comment}; 
		     	
		     	console.log(comment);

		    	this.comments.unshift(comment);


		    	this.commentsobservable = this.http.post(`${this.config.baseUrl}user/unitcomments/`+new_comment.comment_post_ID+`/new/0`,comment,opt)            
            	.map(response =>{  
	                
	                let body = response.json();
	                
	                if(body.hasOwnProperty('comment_data')){
	                	let index = this.comments.findIndex((comment)=>{
	                			console.log(comment.comment_ID);
	                		return parseInt(comment.comment_ID) == new_comment_id;});
	                	
	                	if(index >= 0){
	                		body.comment_data['user']=this.config.user;
	                		this.comments.splice(index,1,body.comment_data);
	                		console.log('this comments notes');
	                	    console.log(this.comments);	
	                		//localstorage save
	                		this.storage.set('comments_'+new_comment.comment_post_ID,this.comments);
                    		this.config.addToTracker('comments',new_comment.comment_post_ID);
	                	}
	                	
	                }
	                

	                return body;
	            });
	            
	    	}
    		if(type == 'reply'){

    			let new_comment_id:number =123456;

		    	let comment = {comment_ID:new_comment_id,...new_comment,comment_parent:comment_id};

		    	this.parse_index_reply(this.comments,comment_id,comment);

			    let opt = this.auth.getUserAuthorizationHeaders();
		    	this.commentsobservable = this.http.post(`${this.config.baseUrl}user/unitcomments/`+new_comment.comment_post_ID+`/reply/`+comment_id,comment,opt)              
	             .map(response =>{  
	                
	                let body = response.json();
	                
	                if(body.hasOwnProperty('comment_data')){
	              	                
	                	this.parse_index_edit(this.comments,new_comment_id,body.comment_data);
	                	
	                }


	                return body;
	            });
	            this.storage.set('comments_'+new_comment.comment_post_ID,this.comments);
                this.config.addToTracker('comments',new_comment.comment_post_ID);
	                
	            

    		}

    		if(type == 'edit'){
    			
    			 
		    	 this.parse_index_edit_content(this.comments,comment_id,new_comment);
		    	 let opt = this.auth.getUserAuthorizationHeaders();
    			 let comment = {'comment_content':new_comment.comment_content};

		    	 this.commentsobservable = this.http.post(`${this.config.baseUrl}user/unitcomments/`+new_comment.comment_post_ID+`/edit/`+comment_id,comment,opt)    
	             .map(response =>{  
	               
	                let body = response.json();

	                	 this.parse_index_edit_content(this.comments,comment_id,body.comment_data);
	               
	                return body;
	            });
	             this.storage.set('comments_'+new_comment.comment_post_ID,this.comments);
                 this.config.addToTracker('comments',new_comment.comment_post_ID);
	            
            }

		    		
	    	
	       	return this.commentsobservable;	 
	    }
 

}
