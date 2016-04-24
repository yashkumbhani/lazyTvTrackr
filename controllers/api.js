var User = require('../models/User');
var Show = require('../models/Show');
var mongoose = require('mongoose')
var Promise = require('bluebird');
Promise.promisifyAll(User);
Promise.promisifyAll(Show);


exports.postSubscribe = function(req, res, next) {


  			var showId,
  			    userId,
  			    index;

  			Show.
  			findOne().
  			where('showId').equals(parseInt(req.body.showId)).
  			exec(function(err,show){
  				if(!err && show){
  				 userId = mongoose.Types.ObjectId(req.user._id);
 				 showId = mongoose.Types.ObjectId(show._id);

 				 index = req.user.series.indexOf(show._id);
 				 
 				if(index == -1){
	  				show.subscribers.push(userId);
	  				
			    	show.save(function(err) {
			      		if (err) return next(err);
			       	});	
  				}	
  			}		
		    
		  	}).then(function(){
		  		if(index == -1 && showId){
		  			
		  			req.user.series.push(showId);
		 			req.user.save(function(err) {
			      		if (err) return next(err)
			    		res.send(200)	
			    	})
		  	
		  	}else
		  	res.end('didnt write to database')	
		})
        .catch(function(err){
            res.send('Error')
        });
};


exports.postUnsubscribe = function(req, res, next) {
   
    var showId;
    var userId;
    var index;

   	Show.
  	findOne().
  	where('showId').equals(parseInt(req.body.showId)).
  	exec(function(err,show){
        if(!err && show){
            userId = mongoose.Types.ObjectId(req.user._id);
            showId = mongoose.Types.ObjectId(show._id);
            index = req.user.series.indexOf(show._id);
            
            show.subscribers.splice(index,1);
    
            show.save(function(err) {
                if (err) return next(err);
                });   
            }  
    })
    .then(function(){

        if(index != -1  && showId){

        var index = req.user.series.indexOf(showId );
        req.user.series.splice(index,1);
        req.user.save(function(err) {
            if (err) return next(err);
            res.send(200)
        })
    }
    else
        res.send('invalid showid or u r not subscribed to that show')
    })        
    .catch(function(err){
        res.end('Error page')
    })

	
};

exports.getShow = function(req,res,next){
   
    Show
    .find()
    .where('showId').equals(parseInt(req.params.showId))
    .select({subscribers:0 })
    .exec(function(err,show){
        if(show){
            res.end(JSON.stringify(show));
        }
    }).
    catch(function(err){
        res.end('Error page')
    })
}

exports.search = function(req,res,next){
   
   try{

        var re = new RegExp(req.query.searchId, 'i');
        Show.
        find().
        where({'name': { $regex: re }}).
        select({ name :1, _id :1 , showId : 1 , 'rating.average' : 1, image : 1}).
        sort('-rating.average').
        exec(function(err,show){
            if(show){
                res.end(JSON.stringify(show));
            }
        })
   }catch(err){
    res.send('error')
   }   
}


exports.getUserShows = function(req,res,next){
    if(!req.user){
        res.redirect('/login')
    }
    else{

        try{
            Show.
            find().
            where({_id: { $in: req.user.series }}).
            select({ name :1, _id :1 , showId : 1 , 'rating.average' : 1 , image : 1}).
            sort('-rating.average').
            exec(function(err,show){
                if(show){
                    res.end(JSON.stringify(show));
                }
        })
        }catch(err){
              res.send('errsssssssssor')
        } 
    }    
}

exports.getSeasons = function(req,res,next){
    if(!req.user){
        res.redirect('/login');
    }
    else{
        try{
         console.log(req.params.showId , '  ' , req.params.seasonId)
         var showId = parseInt(req.params.showId);
         var seasonId = parseInt( req.params.seasonId)
        
        Show
      .aggregate([{$match : {showId : showId}},
                { $project : {
                    episodes : { $filter :{
                            input : '$episodes',
                            as : 'episode',
                            cond : {$eq : ['$$episode.season', seasonId]}
                            }
                    }
             
                }}
                ])
            .exec(function(err,show){
             console.log(show,'-------------1-----------')
                 if(show){
                    res.end(JSON.stringify(show));
                }
                

            })
        }catch(err){

        }
    }
}


exports.getRecent = function(req,res,next){
    if(!req.user){
        res.redirect('/login');
    }
    else{
        console.log(req.user.series)
        try{
 

         var seasonId = parseInt( req.params.seasonId)


 Show
      .aggregate([
                    {
                        $match :{_id: { $in: req.user.series }}
                    },
                    { 
                    $project : {episodes : 1 , name : 1}
                    },
                    {
                        $sort : {'episodes.uts' : -1}
                    },
                    {
                        $limit : 2
                    }
                
                ])
            .exec(function(err,show){
             console.log(show,'-------------1-----------')
                 if(show){
                    res.end(JSON.stringify(show));
                }
            })

        }catch(err){

        }
    }
}

exports.getEpisodeList = function(req,res,next){

    var toUTS = parseFloat(req.query.toUTS); 
    var fromUTS = parseFloat(req.query.fromUTS);

    console.log(toUTS , '-----------toUTS-------', typeof(toUTS));
    console.log(fromUTS , '-----------fromUTS-------', typeof(fromUTS));


     if(!req.user){
        res.redirect('/login');
    }else{

        try{


        Show
      .aggregate([{

                $match :{_id: { $in: req.user.series }}
                },
                { $project : {
                    episodes : { $filter :{
                                    input : '$episodes',
                                    as : 'episode',
                                    cond : {
                                        
                                    $and: [ 
                                         {"$lte": [ "$$episode.uts", toUTS ]},
                                         {"$gte": [ "$$episode.uts", fromUTS ]}
                                        ]
                                     }
                            }
                    }
             
                }}
                ])
            .exec(function(err,show){
             console.log(show,'-------------1-----------')
                 if(show){
                    res.end(JSON.stringify(show));
                }
                

            })

        }catch(err){

        }
    }


}
