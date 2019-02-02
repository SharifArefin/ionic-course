export class Comment{
	constructor(
		public comment_ID:number,
        public comment_post_ID: number,
        public comment_date:string,
        public comment_content:string,
        public comment_approved:number,
        public comment_type: string,
        public comment_parent: number,
        public user_id:number,
        public child: null
	){}
}
