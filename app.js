var express = require('express');
var mysql = require('mysql');
var app = express();
var favicon = require('serve-favicon');


app.use(express.static(__dirname + '/public'));
app.use(favicon('favicon.ico'));

app.set('port',(process.env.PORT || 5000));
app.set('views',__dirname + '/pages');
app.set('view engine', 'ejs');

const dataSite = {
	uri:{
		rootSite:'http://steamworld-heist.compendium.canbotics.ca',
		rootAsset:'http://asset.canbotics.ca/compendium/',
		rootAssetGlobal:'http://asset.canbotics.ca/global/'},
	en:{
		title:'Compendium',
		game:'Steamworld Heist',
		disc:'Steamworld Heist &copy; <a href="http://imageform.se/" rel="external">Image & Form Games</a>.',
		term:{
			charHealth:'Health',
			charMove:'Movement Speed',
			charGun:'Gun Damage',
			charMelee:'Melee Damage',
			abilStart:'Starting Ability',
			abilLevel:'Level [LEVEL]',
			abilPass:'Passive',
			abilCool:'Cooldown: [COUNT] turns',
			abilCons:'Uses/mission: [COUNT]'
		}
	},
	fr:{
		title:'Compendium',
		game:'Steamworld Heist',
		disc:'Steamworld Heist <abbr title="marque déposée">MD</abbr> <a href="http://imageform.se/" rel="external">Image & Form Games</a>.\nLes traductions sont effectuées en utilisant <a href="https://translate.google.com/" rel="external nofollow">Google Translate</a>.',
		term:{
			charHealth:'Santé',
			charMove:'Vitesse de mouvement',
			charGun:'Dommages causés par une arme à feu',
			charMelee:'Dégâts de mélée',
			abilStart:'Aptitude ou démarrage',
			abilLevel:'Niveau [LEVEL]',
			abilPass:'Passive',
			abilCool:'Recharge: [COUNT] tours',
			abilCons:'Usages/mission: [COUNT]'
		}
	}
};

const dataPage = {
	index:{
		en:{
			title:'Home',
			desc:'',
			uri:'/en'
		},
		fr:{
			title:'Accueil',
			desc:'',
			uri:'/fr'
		}
	},
	
	
	
	character:{
		en:{
			title:'Characters',
			desc:'View the complete list of playable characters available in ' + dataSite.en.game + '.',
			uri:'/en/characters'
		},
		fr:{
			title:'Personnages',
			desc:'Voir la liste complète des personnages jouables disponibles dans ' + dataSite.fr.game + '.',
			uri:'/fr/personnages'
		}
		
		
	},
	characterDetail:{
		en:{
			title:'[CHARACTERNAME]',
			desc:'View the character profile of [CHARACTERNAME], from ' + dataSite.en.game + '.',
			uri:'/en/characters/'
		},
		fr:{
			title:'[CHARACTERNAME]',
			desc:'Voir le profil du personnage de [CHARACTERNAME], de ' + dataSite.fr.game + '.',
			uri:'/fr/personnages/'
		}
		
		
	},
	
	
	hat:{
		en:{
			title:'Hats',
			desc:'View the complete list of hats available in ' + dataSite.en.game + '.',
			uri:'/en/hats'
		},
		fr:{
			title:'Chapeaux',
			desc:'Voir la liste complète des chapeaux disponibles dans ' + dataSite.fr.game + '.',
			uri:'/fr/chapeaux'
		}
	},
	hatDetail:{
		en:{
			title:'[HATNAME]',
			desc:'View the details of the [HATNAME] hat in ' + dataSite.en.game + '.',
			uri:'/en/hats/'
		},
		fr:{
			title:'[HATNAME]',
			desc:'Voir les détails du chapeau [HATNAME] dans ' + dataSite.fr.game + '.',
			uri:'/fr/chapeaux/'
		}
		
		
	}
};











/* =================================== BASE PAGES */
/* ============================================== */
/* ============================================== ROOT LANDING PAGE */
app.get('/',function(request,response) {
	response.render('landing',{dataSite:dataSite});
});

/* ============================================== INDEX */

app.get('/:langCode(en|fr)',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'index',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'index',page:'index'},disc:[]};
	var detailRequest = {};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.index) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = dataPage.index[language].title;
						detailPage.meta.title = dataSite[language].game;
						detailPage.meta.desc = dataPage.index[language].desc;
						
					}
					detailPage.uri[language] = dataPage.index[language].uri;
				}
				resolve(true);
				
			} catch(error) {reject(error);}
		})
	}

	Promise.all([setDetailPage()]).then(() => {
		response.render('template',{dataSite:dataSite,detailPage:detailPage,detailRequest:detailRequest});	
	}).catch(function(err) {console.log(err);})
});












app.get('/:langCode(en|fr)/:characters(characters|personnages)',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'character',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'characters',page:'characters'},disc:[]};
	var detailRequest = {character:{},order:[]};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.character) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = dataPage.character[language].title;
						detailPage.meta.title = dataPage.character[language].title + ' | ' + dataSite[language].game;
						detailPage.meta.desc = dataPage.character[language].desc;
					}
					detailPage.uri[language] = dataPage.character[language].uri;
				}
				resolve(true);
			} catch(error) {reject(error);}
		})
	}

	function queryCharacters(cnx) {
		return new Promise(function(resolve, reject) {
			
			cnx.query('SELECT pc_name, pc_hp, pc_move, CONCAT_WS("-",pc_dmgl,pc_dmgh) AS pc_dmg, pc_melee, pc_uri, pc_asset, pc_desc, role_name FROM lib_pc INNER JOIN lib_pc_lang ON lib_pc.pc_id = lib_pc_lang.pc_id INNER JOIN sys_lang on lib_pc_lang.lang_id = sys_lang.lang_id AND sys_lang.lang_code = ? INNER JOIN lib_role_lang ON lib_pc.role_id = lib_role_lang.role_id AND lib_role_lang.lang_id = sys_lang.lang_id ORDER BY lib_pc.pc_id',[detailPage.lang], function (error, results, fields) {
				if (error) reject(error);
				
				results.forEach(function(rsQuery){
					detailRequest.character[rsQuery.pc_name] = {
						name:rsQuery.pc_name,
						uri:rsQuery.pc_uri,
						asset:rsQuery.pc_asset,
						hp:rsQuery.pc_hp,
						move:rsQuery.pc_move,
						dmg:rsQuery.pc_dmg,
						melee:rsQuery.pc_melee,
						role:rsQuery.role_name,
						desc:rsQuery.pc_desc};
					
					detailRequest.order.push(detailRequest.character[rsQuery.pc_name]);
				})
				resolve(true);
			})
		})
	}

	dataOpen().then((cnx) => {
		Promise.all([setDetailPage(), queryCharacters(cnx)]).then(() => {
			Promise.all([dataClose(cnx)]).then(() => {
				response.render('template',{dataSite:dataSite,detailPage:detailPage,detailRequest:detailRequest});	
			}).catch(function(err) {console.log(err);})
		}).catch(function(err) {console.log(err);})
	}).catch(function(err) {console.log(err);})
});

app.get('/:langCode(en|fr)/:characters(characters|personnages)/:character',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'character-detail',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'characters',page:'detail'},disc:[]};
	var detailRequest = {character:{},abilities:{},order:[]};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.character) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = dataPage.characterDetail[language].title;
						detailPage.meta.title = dataPage.characterDetail[language].title + ' | ' + dataPage.character[language].title + ' | ' + dataSite[language].game;
						detailPage.meta.desc = dataPage.characterDetail[language].desc;
					}
					detailPage.uri[language] = dataPage.character[language].uri + '/';
				}
				resolve(true);
				
			} catch(error) {reject(error);}
		})
	}

	function queryCharacter(cnx) {
		return new Promise(function(resolve, reject) {

			cnx.query('SELECT lib_pc.pc_id, lib_pc_lang.pc_name, pc_hp, pc_move, CONCAT_WS("-",pc_dmgl,pc_dmgh) AS pc_dmg, pc_melee, lib_pc_lang.pc_uri, pc_asset, lib_pc_lang.pc_desc, role_name, lang_code FROM lib_pc INNER JOIN lib_pc_lang AS tblFilter ON lib_pc.pc_id = tblFilter.pc_id AND tblFilter.pc_uri = ? INNER JOIN lib_pc_lang ON lib_pc.pc_id = lib_pc_lang.pc_id INNER JOIN sys_lang on lib_pc_lang.lang_id = sys_lang.lang_id INNER JOIN lib_role_lang ON lib_pc.role_id = lib_role_lang.role_id AND lib_role_lang.lang_id = sys_lang.lang_id',[request.params.character], function (error, results, fields) {
				if (error) reject(error);
				
				results.forEach(function(rsQuery){
					if (rsQuery.lang_code == detailPage.lang) {
						detailRequest.character = {
							id:rsQuery.pc_id,
							name:rsQuery.pc_name,
							uri:rsQuery.pc_uri,
							asset:rsQuery.pc_asset,
							hp:rsQuery.pc_hp,
							move:rsQuery.pc_move,
							dmg:rsQuery.pc_dmg,
							melee:rsQuery.pc_melee,
							role:rsQuery.role_name,
							desc:rsQuery.pc_desc};
					}
					
					detailPage.uri[rsQuery.lang_code] += rsQuery.pc_uri;
					//detailRequest.order.push(detailRequest.characters[rsQuery.pc_name]);
				})
				detailPage.meta.heading = detailPage.meta.heading.replace('[CHARACTERNAME]',detailRequest.character.name);
				detailPage.meta.title = detailPage.meta.title.replace('[CHARACTERNAME]',detailRequest.character.name);
				detailPage.meta.desc = detailPage.meta.desc.replace('[CHARACTERNAME]',detailRequest.character.name);

				resolve(true);
			})
		})
	}

	function queryAbilities(cnx) {
		return new Promise(function(resolve, reject) {

			cnx.query('SELECT ability_name, ability_asset, ability_type, ability_count, ability_desc, pc_level FROM lib_ability INNER JOIN lib_ability_lang ON lib_ability.ability_id = lib_ability_lang.ability_id INNER JOIN sys_lang ON lib_ability_lang.lang_id = sys_lang.lang_id AND sys_lang.lang_code = ? INNER JOIN xref_pc_ability ON lib_ability.ability_id = xref_pc_ability.ability_id AND xref_pc_ability.pc_id = ? ORDER BY pc_level, lib_ability.ability_id',[detailPage.lang,detailRequest.character.id], function (error, results, fields) {
				if (error) reject(error);
				
				results.forEach(function(rsQuery){
					detailRequest.abilities[rsQuery.ability_name] = {
						name:rsQuery.ability_name,
						asset:rsQuery.ability_asset,
						type:rsQuery.ability_type,
						count:rsQuery.ability_count,
						desc:rsQuery.ability_desc,
						level:rsQuery.pc_level};
					
					detailRequest.order.push(detailRequest.abilities[rsQuery.ability_name]);
				})

				resolve(true);
			})
		})
	}
	
	dataOpen().then((cnx) => {
		Promise.all([setDetailPage(), queryCharacter(cnx)]).then(() => {
			Promise.all([queryAbilities(cnx)]).then(() => {
				Promise.all([dataClose(cnx)]).then(() => {
					response.render('template',{dataSite:dataSite,detailPage:detailPage,detailRequest:detailRequest});	
				}).catch(function(err) {console.log(err);})
			}).catch(function(err) {console.log(err);})
		}).catch(function(err) {console.log(err);})
	}).catch(function(err) {console.log(err);})
});










app.get('/:langCode(en|fr)/:hats(hats|chapeaux)',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'hat',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'hats',page:'hats'},disc:[]};
	var detailRequest = {hat:{},order:[]};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.hat) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = dataPage.hat[language].title;
						detailPage.meta.title = dataPage.hat[language].title + ' | ' + dataSite[language].game;
						detailPage.meta.desc = dataPage.hat[language].desc;
					}
					detailPage.uri[language] = dataPage.hat[language].uri;
				}
				resolve(true);
			} catch(error) {reject(error);}
		})
	}

	function queryHats(cnx) {
		return new Promise(function(resolve, reject) {
			cnx.query('SELECT hat_name, hat_uri, hat_desc, hat_asset, hat_class_name FROM lib_hat INNER JOIN lib_hat_lang ON lib_hat.hat_id = lib_hat_lang.hat_id INNER JOIN sys_lang ON lib_hat_lang.lang_id = sys_lang.lang_id AND sys_lang.lang_code = ? INNER JOIN lib_hat_class_lang ON lib_hat.hat_class_id = lib_hat_class_lang.hat_class_id ORDER BY lib_hat.hat_id',[detailPage.lang], function (error, results, fields) {
				if (error) reject(error);
				
				results.forEach(function(rsQuery){
					detailRequest.hat[rsQuery.hat_name] = {
						name:rsQuery.hat_name,
						uri:rsQuery.hat_uri,
						asset:rsQuery.hat_asset,
						class:rsQuery.hat_class_name,
						desc:rsQuery.hat_desc};
					
					detailRequest.order.push(detailRequest.hat[rsQuery.hat_name]);
				})
				resolve(true);
			})
		})
	}

	dataOpen().then((cnx) => {
		Promise.all([setDetailPage(), queryHats(cnx)]).then(() => {
			Promise.all([dataClose(cnx)]).then(() => {
				response.render('template',{dataSite:dataSite,detailPage:detailPage,detailRequest:detailRequest});	
			}).catch(function(err) {console.log(err);})
		}).catch(function(err) {console.log(err);})
	}).catch(function(err) {console.log(err);})
});

app.get('/:langCode(en|fr)/:hats(hats|chapeaux)/:hat',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'hat-detail',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'hats',page:'hats'},disc:[]};
	var detailRequest = {hat:{},order:[]};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.hat) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = dataPage.hatDetail[language].title;
						detailPage.meta.title = dataPage.hatDetail[language].title + ' | ' + dataPage.hat[language].title + ' | ' + dataSite[language].game;
						detailPage.meta.desc = dataPage.hatDetail[language].desc;
					}
					detailPage.uri[language] = dataPage.hat[language].uri + '/';
				}
				resolve(true);
				
			} catch(error) {reject(error);}
		})
	}

	function queryHat(cnx) {
		return new Promise(function(resolve, reject) {
			cnx.query('SELECT lib_hat_lang.hat_name, lib_hat_lang.hat_uri, lib_hat_lang.hat_desc, hat_asset, hat_class_name, lang_code FROM lib_hat INNER JOIN lib_hat_lang AS tblFilter ON lib_hat.hat_id = tblFilter.hat_id AND tblFilter.hat_uri = ? INNER JOIN lib_hat_lang ON lib_hat.hat_id = lib_hat_lang.hat_id INNER JOIN sys_lang ON lib_hat_lang.lang_id = sys_lang.lang_id INNER JOIN lib_hat_class_lang ON lib_hat.hat_class_id = lib_hat_class_lang.hat_class_id AND lib_hat_class_lang.lang_id = lib_hat_lang.lang_id',[request.params.hat], function (error, results, fields) {
				if (error) reject(error);
				
				results.forEach(function(rsQuery){
					if (rsQuery.lang_code == detailPage.lang) {
						detailRequest.hat = {
							name:rsQuery.hat_name,
							uri:rsQuery.hat_uri,
							asset:rsQuery.hat_asset,
							class:rsQuery.hat_class_name,
							desc:rsQuery.hat_desc};
					}
					detailPage.uri[rsQuery.lang_code] += rsQuery.hat_uri;
					
					//detailRequest.order.push(detailRequest.hat[rsQuery.hat_name]);
				})
				
				//console.log(detailRequest);
				//console.log(detailPage);
				detailPage.meta.heading = detailPage.meta.heading.replace('[HATNAME]',detailRequest.hat.name);
				detailPage.meta.title = detailPage.meta.title.replace('[HATNAME]',detailRequest.hat.name);
				detailPage.meta.desc = detailPage.meta.desc.replace('[HATNAME]',detailRequest.hat.name);
				//console.log("\t===\n\t===");
				//console.log(detailPage);

				resolve(true);
			})
		})
	}
	dataOpen().then((cnx) => {
		Promise.all([setDetailPage(), queryHat(cnx)]).then(() => {
			Promise.all([dataClose(cnx)]).then(() => {
				response.render('template',{dataSite:dataSite,detailPage:detailPage,detailRequest:detailRequest});	
			}).catch(function(err) {console.log(err);})
		}).catch(function(err) {console.log(err);})
	}).catch(function(err) {console.log(err);})
});































app.get('/:langCode(en|fr|jp|de)/:thehunt(the-hunt|contrats-de-chasse|mobuhanto|hohe-jagd)',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'the-hunt',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'game',game:'ffxiv',page:'thehunt'},disc:[]};
	var detailRequest = {region:{},zone:{},hunt:{},regions:[]};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.thehunt) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = dataPage.thehunt[language].title;
						detailPage.meta.title = dataPage.thehunt[language].title + ' | Final Fantasy XIV';
						detailPage.meta.desc = dataPage.thehunt[language].desc;
						
					}
					detailPage.uri[language] = dataPage.thehunt[language].uri;
				}
				resolve(true);
				
			} catch(error) {reject(error);}
		})
	}

	function queryHunts(cnx) {
		return new Promise(function(resolve, reject) {
			cnx.query('SELECT hunt_name, hunt_uri, hunt_rank, zone_name, zone_uri, region_name, region_uri FROM lib_hunt INNER JOIN lib_hunt_lang ON lib_hunt.hunt_id = lib_hunt_lang.hunt_id AND lib_hunt_lang.hunt_lang = ? INNER JOIN lib_zone ON lib_hunt.zone_id = lib_zone.zone_id INNER JOIN lib_zone_lang ON lib_zone.zone_id = lib_zone_lang.zone_id AND lib_zone_lang.zone_lang = lib_hunt_lang.hunt_lang INNER JOIN lib_expansion ON lib_zone.expansion_id = lib_expansion.expansion_id INNER JOIN lib_region ON lib_zone.region_id = lib_region.region_id INNER JOIN lib_region_lang ON lib_region.region_id = lib_region_lang.region_id AND lib_region_lang.region_lang = lib_hunt_lang.hunt_lang ORDER BY region_order, region_name, zone_name, hunt_rank, hunt_name',[detailPage.lang], function (error, results, fields) {
				if (error) reject(error);

				results.forEach(function(rsQuery){
					if (detailRequest.region[rsQuery.region_name] == undefined){
						detailRequest.region[rsQuery.region_name] = {name:rsQuery.region_name,uri:rsQuery.region_uri,zones:[]};
						detailRequest.regions.push(detailRequest.region[rsQuery.region_name]);
					}
					if (detailRequest.zone[rsQuery.zone_name] == undefined){
						detailRequest.zone[rsQuery.zone_name] = {name:rsQuery.zone_name,uri:rsQuery.zone_uri,b:[],a:[],s:[]};
						detailRequest.region[rsQuery.region_name].zones.push(detailRequest.zone[rsQuery.zone_name]);
					}
					detailRequest.hunt[rsQuery.hunt_name] = {name:rsQuery.hunt_name,uri:rsQuery.hunt_uri,rank:rsQuery.hunt_rank};
					detailRequest.zone[rsQuery.zone_name][rsQuery.hunt_rank.toLowerCase()].push(detailRequest.hunt[rsQuery.hunt_name]);
				})
				
				resolve(true);
			})
		})
	}

	dataOpen().then((cnx) => {
		Promise.all([setDetailPage(), queryHunts(cnx)]).then(() => {
			response.render('template',{dataSite:dataSite,detailPage:detailPage,detailRequest:detailRequest});	
		}).catch(function(err) {console.log(err);})
	}).catch(function(err) {console.log(err);})
});

app.get('/:langCode(en|fr|jp|de)/:thehunt(the-hunt|contrats-de-chasse|mobuhanto|hohe-jagd)/:uriMark',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'the-hunt-mark',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'game',game:'ffxiv',page:'thehunt'},disc:[]};
	var detailRequest = {name:'',uri:'',rank:'',expansion:'',zone:{name:'',uri:''}};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.thehunt) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = detailRequest.name;
						detailPage.meta.title = detailRequest.name + ' | ' + dataPage.thehunt[language].title + ' | Final Fantasy XIV';
						detailPage.meta.desc = dataPage.thehunt[language].desc;
						
					}
					detailPage.uri[language] = dataPage.thehunt[language].uri + '/' + detailRequest.uri;
				}
				resolve(true);
				
			} catch(error) {reject(error);}
		})
	}

	function queryHunt(cnx) {
		return new Promise(function(resolve, reject) {
			cnx.query('SELECT hunt_name, hunt_uri, hunt_rank, if(hunt_respawn_lower = hunt_respawn_upper, hunt_respawn_lower, CONCAT_WS(" - ", hunt_respawn_lower, hunt_respawn_upper)) AS hunt_respawn, if(hunt_maint_lower IS NULL, NULL, if(hunt_maint_lower = hunt_maint_upper, hunt_maint_lower, CONCAT_WS(" - ", hunt_maint_lower, hunt_maint_upper))) AS hunt_maint, hunt_spawn, zone_name, zone_uri, region_name, region_uri, expansion_name FROM lib_hunt INNER JOIN lib_hunt_lang ON lib_hunt.hunt_id = lib_hunt_lang.hunt_id AND lib_hunt_lang.hunt_lang = ? INNER JOIN lib_zone ON lib_hunt.zone_id = lib_zone.zone_id INNER JOIN lib_zone_lang ON lib_zone.zone_id = lib_zone_lang.zone_id AND lib_zone_lang.zone_lang = lib_hunt_lang.hunt_lang INNER JOIN lib_expansion ON lib_zone.expansion_id = lib_expansion.expansion_id INNER JOIN lib_region ON lib_zone.region_id = lib_region.region_id INNER JOIN lib_region_lang ON lib_region.region_id = lib_region_lang.region_id AND lib_region_lang.region_lang = lib_hunt_lang.hunt_lang WHERE hunt_uri = ?',[request.params.langCode,request.params.uriMark], function (error, results, fields) {
				if (error) reject(error);

				results.forEach(function(rsQuery){
					detailRequest.name = rsQuery.hunt_name;
					detailRequest.uri = rsQuery.hunt_uri;
					detailRequest.rank = rsQuery.hunt_rank;
					detailRequest.respawn = rsQuery.hunt_respawn;
					detailRequest.maint = rsQuery.hunt_maint;
					detailRequest.spawn = rsQuery.hunt_spawn;
					detailRequest.expansion = rsQuery.expansion_name;
					detailRequest.zone.name = rsQuery.zone_name;
					detailRequest.zone.uri = rsQuery.zone_uri;
				})
				
				if (!detailRequest.name.length) {
					detailRequest.name = '404 Not Found';
				}
				
				if (detailRequest.rank == 'B') {
					detailRequest.respawnUnit = dataUnit.second[detailPage.lang];
				} else {
					detailRequest.respawnUnit = dataUnit.hour[detailPage.lang];
				}
				
				resolve(true);
			})
		})
	}

	dataOpen().then((cnx) => {
		queryHunt(cnx).then(() => {
			setDetailPage().then(() => {
				response.render('template',{dataSite:dataSite,detailPage:detailPage,detailRequest:detailRequest});	
			}).catch(function(err) {console.log(err);})
		}).catch(function(err) {console.log(err);})
	}).catch(function(err) {console.log(err);})
});



















			
			
		
		
		
		
		
		












function dataOpen () {
	var cnx = mysql.createConnection({host:process.env.DATASTORE.split('|')[0],user:process.env.DATASTORE.split('|')[1],password:process.env.DATASTORE.split('|')[2],database:process.env.DATASTORE.split('|')[3]});

	return new Promise(function(resolve,reject) {
		cnx.connect(function(err) {
			if (err) {
				console.error('\tFailed to connect to DATASTORE :');
				console.error(err.stack);
				console.error("=====\n=====\n=====\n\n");
				reject(err);
			} else {
				console.log('Opened Connection to DATASTORE : ' + cnx.threadId);
				resolve(cnx);
			};
		});
	});
};

function dataClose (cnx) {
	return new Promise(function(resolve,reject) {
		threadId = cnx.threadId;
		cnx.end()
	
		console.log('Closed connection to DATASTORE : ' + threadId);
		resolve(true);
	});
};


/* ================================== APP */
/* ============================================== */
/* ============================================== APP : REQUEST LISTENER */
app.listen(app.get('port'), function() {
	console.log('Compendium ( ' + dataSite.en.game + ' ) is running on port : ', app.get('port'));
});

  