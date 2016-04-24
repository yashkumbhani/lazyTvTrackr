var mongoose = require('mongoose');
var request = require('request');
var timestamp = require('unix-timestamp');
var Promise = require('bluebird');
mongoose.createConnection('mongodb://localhost/local');
var userSchema ,
	showSchema,
	User,
	Show ;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('mongo connected')


userSchema = require('./models/User.js').userSchema ;
showSchema = require('./models/Show.js').showSchema ;

User = mongoose.model('User',userSchema)
Show = mongoose.model('Show', showSchema);
});



exports.addAllShows= function(totalPages){
	
	return new Promise(function(resolve,reject){

		for(var i=0; i< totalPages; i++){
		var uri = 'http://api.tvmaze.com/shows?page='+i ;

		request.get(uri ,function(error,response,body){
		  	if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                try {
                    body = JSON.parse(body);
                    } catch (e) {
                           console.log('body is not JSON for ',uri);
                       	}
                    }
			for(var j =0; j <q.length ; j++){
				q[j].showId = q[j].id
				var show1 = new Show(q[j]);
		  		show1.save(function(err) {
    				if (err) return next(err);
    			});
			}
		})
		}

	})
}	


exports.getAllShowIds = function(){
	return new Promise (function(resolve,reject){

		Show.
  		find().
   		select('showId').
  		exec(function(err,showIds){
  			if(err)
  				console.log(err)
  			var result = JSON.stringify(showIds);
  			resolve(JSON.parse(result));
 		})
	
	});
}


exports.getAllEpisodes = function(showId){

	return new Promise(function(resolve) {

		var theShowId = JSON.stringify(showId);
		var uri = 'http://api.tvmaze.com/shows/'+theShowId+'/episodes';
			console.log(uri);
			request.get(uri,function(error,response,body){
			
		try {
			if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                body = JSON.parse(body);
            	
            }
			} catch (e) {
                           console.log('body is not JSON for ',uri);
                       	}
			for(i=0; i< body.length ; i++ ){
				if(body[i].airdate && body[i].airtime)
					body[i].uts = timestamp.fromDate(body[i].airdate+'T'+body[i].airtime);
				
				}
			var result = {
				episodes:body,
				showId:showId
			}
			resolve(result) ;

		});
	});
}

exports.addAllEpisodes	= function(episodes,showId){

	return new Promise (function(resolve){
		var query = {"showId": showId};
		var update = {episodes:episodes};
		var options = {new: true};
	
		Show.findOneAndUpdate(query, update, options, function(err, show) {
  			if (err) {
    			console.log('got an error');
  			}
  			console.log('updated');
  			resolve();
		});
	})
}


exports.getAndAddSeasons = function(showId,_id){
	return new Promise(function(resolve,reject){

	//	var showId = JSON.stringify(showId);
		var uri = 'http://api.tvmaze.com/shows/'+showId+'/seasons';
		var  showIdd = mongoose.Types.ObjectId(_id);

		
		console.log(uri);
			request.get(uri,function(error,response,body){
			
		try {
			if (/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                body = JSON.parse(body);
            	
            }
			} catch (e) {
                           console.log('body is not JSON for ',uri);
                       	}
			Show
			.findOne(showIdd)
			.exec(function(err,show){
				if(show){

					
					show.seasons = body;
					show.save(function(err,data){
						if(err) console.log(err);
						else{
							console.log(data._id,'------------------yash---------------')
							resolve();
						}
					})
				}
				else{
					resolve()
				}
				
			})

		});

	})
}