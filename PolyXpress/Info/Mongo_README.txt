Tasty tidbit from Ticket #23 on changing document formats in mongo:

In process of changing, but eventually will need to do this command for online db in a shell:
db.events.update({author:  {$exists: true}}, {$rename: {'author': 'authors'}},{multi: true});
for all collections
	Then need to change the type:
	db.chapters.find({authors : {$exists : true}}).forEach( function(obj) { printjson(obj.authors); obj.authors = new Array(obj.authors); db.chapters.save(obj);} );

