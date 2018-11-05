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
		disc:'Site design and underlying code &copy; 2018 OciCat Media.<br>Steamworld Heist &copy; <a href="http://imageform.se/" rel="external">Image & Form Games</a>.',
		term:{
			genDesc:'Description',
			genConstruct:'Under Construction',
			
			labLang:'Select Language',
			labNavSite:'Site Navigation',
			labLegal:'Legal Disclaimers',
			
			charHealth:'Health',
			charMove:'Movement Speed',
			charGun:'Gun Damage',
			charMelee:'Melee Damage',
			charAll:'All Characters',
			
			abilStart:'Starting Ability',
			abilLevel:'Level [LEVEL]',
			abilPass:'Passive',
			abilCool:'Cooldown: [COUNT] turns',
			abilCons:'Uses/mission: [COUNT]',
			
			hatAll:'All Hats',
			hatAvail:'Available From',
			
			stageChallenge:'Challenge Mission',
			
			stagebattleAll:'All Battle Stages',
			stageBattleEnemies:'Possible Enemies',
			
			stageBattleEpic:['1 epic loot box available.','[NUMBER] epic loot boxes available.'],
			stageBattleChar:['1 character slot.','[NUMBER] character slots.'],
			stageBattleStar:['1 star rating possible.','[NUMBER] star rating possible.']
		}
	},
	fr:{
		title:'Compendium',
		game:'Steamworld Heist',
		disc:'Conception du site Web et code sous-jacent &copy; 2019 OciCat Media.<br>Steamworld Heist &copy; <a href="http://imageform.se/" rel="external">Image & Form Games</a>.<br>Certains textes peuvent être traduits avec <a href="https://translate.google.com/" rel="external nofollow">Google Translate</a>.',
		term:{
			genDesc:'La description',
			genConstruct:'En construction',

			labLang:'Choisir la langue',
			labNavSite:'Navigation sur le site',
			labLegal:'Déni de responsabilité',

			charHealth:'Santé',
			charMove:'Vitesse de mouvement',
			charGun:'Dommages causés par une arme à feu',
			charMelee:'Dégâts de mélée',
			charAll:'Tous les personnages',
			
			abilStart:'Aptitude ou démarrage',
			abilLevel:'Niveau [LEVEL]',
			abilPass:'Passive',
			abilCool:'Recharge: [COUNT] tours',
			abilCons:'Usages/mission: [COUNT]',
			
			hatAll:'Tous les chapeaux',
			hatAvail:'Disponible depuis',

			stageChallenge:'Mission Défi',
			
			stagebattleAll:'Toutes les étapes de la bataille',
			stageBattleEnemies:'Ennemis possibles',
			stageBattleEpic:['1 boîte à lettres épique disponible.','[NUMBER] boîtes à surprises épiques disponibles.'],
			stageBattleChar:['1 emplacement de personnage.','[NUMBER] emplacements de personnage.'],
			stageBattleStar:['1 étoile possible.','[NUMBER] 1 étoile possible.']
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
		
		
	},
	


	
	stage:{
		en:{
			title:'Stages',
			desc:'' + dataSite.en.game + '.',
			uri:'/en/stages'
		},
		fr:{
			title:'Étapes',
			desc:'' + dataSite.fr.game + '.',
			uri:'/fr/etapes'
		}
	},
	stageBattle:{
		en:{
			title:'Battle Stages',
			desc:'' + dataSite.en.game + '.',
			uri:'/en/stages/battle'
		},
		fr:{
			title:'Étapes de bataille',
			desc:'' + dataSite.fr.game + '.',
			uri:'/fr/etapes/bataille'
		}
		
		
	},
	stageBattleDetail:{
		en:{
			title:'[STAGENAME]',
			desc:'' + dataSite.en.game + '.',
			uri:'/en/stages/battle/'
		},
		fr:{
			title:'[STAGENAME]',
			desc:'' + dataSite.fr.game + '.',
			uri:'/fr/etapes/bataille/'
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

			cnx.query('SELECT DISTINCT lib_pc.pc_id, lib_pc_lang.pc_name, pc_hp, pc_move, CONCAT_WS("-",pc_dmgl,pc_dmgh) AS pc_dmg, pc_melee, lib_pc_lang.pc_uri, pc_asset, lib_pc_lang.pc_desc, role_name, lang_code FROM lib_pc INNER JOIN lib_pc_lang AS tblFilter ON lib_pc.pc_id = tblFilter.pc_id AND tblFilter.pc_uri = ? INNER JOIN lib_pc_lang ON lib_pc.pc_id = lib_pc_lang.pc_id INNER JOIN sys_lang on lib_pc_lang.lang_id = sys_lang.lang_id INNER JOIN lib_role_lang ON lib_pc.role_id = lib_role_lang.role_id AND lib_role_lang.lang_id = sys_lang.lang_id',[request.params.character], function (error, results, fields) {
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
			cnx.query('SELECT hat_name, hat_uri, hat_desc, hat_asset, hat_class_name FROM lib_hat INNER JOIN lib_hat_lang ON lib_hat.hat_id = lib_hat_lang.hat_id INNER JOIN sys_lang ON lib_hat_lang.lang_id = sys_lang.lang_id AND sys_lang.lang_code = ? INNER JOIN lib_hat_class_lang ON lib_hat.hat_class_id = lib_hat_class_lang.hat_class_id AND lib_hat_class_lang.lang_id = sys_lang.lang_id ORDER BY lib_hat.hat_id',[detailPage.lang], function (error, results, fields) {
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
				})
				
				detailPage.meta.heading = detailPage.meta.heading.replace('[HATNAME]',detailRequest.hat.name);
				detailPage.meta.title = detailPage.meta.title.replace('[HATNAME]',detailRequest.hat.name);
				detailPage.meta.desc = detailPage.meta.desc.replace('[HATNAME]',detailRequest.hat.name);

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



















app.get('/:langCode(en|fr)/:stages(stages|etapes)',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'stage',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'stages',page:'stages'},disc:[]};
	var detailRequest = {};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.stage) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = dataPage.stage[language].title;
						detailPage.meta.title = dataPage.stage[language].title + ' | ' + dataSite[language].game;
						detailPage.meta.desc = dataPage.stage[language].desc;
					}
					detailPage.uri[language] = dataPage.stage[language].uri;
				}
				resolve(true);
			} catch(error) {reject(error);}
		})
	}

	Promise.all([setDetailPage()]).then(() => {
		response.render('template',{dataSite:dataSite,detailPage:detailPage,detailRequest:detailRequest});	
	}).catch(function(err) {console.log(err);})
});


app.get('/:langCode(en|fr)/:stages(stages|etapes)/:battles(battle|bataille)',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'stage-battle',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'stages',page:'battle'},disc:[]};
	var detailRequest = {battle:{},order:[]};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.stageBattle) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = dataPage.stageBattle[language].title;
						detailPage.meta.title = dataPage.stageBattle[language].title + ' | ' + dataSite[language].game;
						detailPage.meta.desc = dataPage.stageBattle[language].desc;
					}
					detailPage.uri[language] = dataPage.stageBattle[language].uri;
				}
				resolve(true);
			} catch(error) {reject(error);}
		})
	}

	function queryStages(cnx) {
		return new Promise(function(resolve, reject) {
			cnx.query('SELECT battle_name, battle_uri, battle_desc, battle_challenge, battle_epic, battle_char, battle_star, region_name, region_uri, decal_uri FROM lib_stage_battle INNER JOIN lib_stage_battle_lang ON lib_stage_battle.battle_id = lib_stage_battle_lang.battle_id INNER JOIN sys_lang on lib_stage_battle_lang.lang_id = sys_lang.lang_id AND sys_lang.lang_code = ? INNER JOIN lib_stage_decal ON lib_stage_battle.decal_id = lib_stage_decal.decal_id INNER JOIN lib_region_lang ON lib_stage_battle.region_id = lib_region_lang.region_id AND lib_region_lang.lang_id = lib_stage_battle_lang.lang_id ORDER BY lib_stage_battle.battle_id',[detailPage.lang], function (error, results, fields) {
				if (error) reject(error);
				
				results.forEach(function(rsQuery){
					
					detailRequest.battle[rsQuery.battle_name] = {
						name:rsQuery.battle_name,
						uri:rsQuery.battle_uri,
						desc:rsQuery.battle_desc,
						attr:[rsQuery.battle_epic, rsQuery.battle_char, rsQuery.battle_star],
						challenge: rsQuery.battle_challenge,
						asset:rsQuery.decal_uri,
						region:[rsQuery.region_name, rsQuery.region_uri]};
					
					detailRequest.order.push(detailRequest.battle[rsQuery.battle_name]);
				})
				resolve(true);
			})
		})
	}

	dataOpen().then((cnx) => {
		Promise.all([setDetailPage(), queryStages(cnx)]).then(() => {
			Promise.all([dataClose(cnx)]).then(() => {
				response.render('template',{dataSite:dataSite,detailPage:detailPage,detailRequest:detailRequest});	
			}).catch(function(err) {console.log(err);})
		}).catch(function(err) {console.log(err);})
	}).catch(function(err) {console.log(err);})
});

app.get('/:langCode(en|fr)/:stages(stages|etapes)/:battles(battle|bataille)/:stage',function(request,response) {
	var detailPage = {lang:request.params.langCode,template:'stage-battle-detail',uri:{},meta:{heading:'',title:'',desc:''},nav:{segment:'stages',page:'battle'},disc:[]};
	var detailRequest = {battle:{},order:[]};

	function setDetailPage() {
		return new Promise(function(resolve, reject) {
			try {
				for (language in dataPage.stageBattle) {
					if (language == detailPage.lang) {
						detailPage.meta.heading = dataPage.stageBattleDetail[language].title;
						detailPage.meta.title = dataPage.stageBattleDetail[language].title + ' | ' + dataPage.stageBattle[language].title + ' | ' + dataSite[language].game;
						detailPage.meta.desc = dataPage.stageBattleDetail[language].desc;
					}
					detailPage.uri[language] = dataPage.stageBattleDetail[language].uri;
				}
				resolve(true);
			} catch(error) {reject(error);}
		})
	}

	function queryStage(cnx) {
		return new Promise(function(resolve, reject) {
			cnx.query('SELECT DISTINCT lib_stage_battle_lang.battle_name, lib_stage_battle_lang.battle_uri, lib_stage_battle_lang.battle_desc, battle_challenge, battle_epic, battle_char, battle_star, region_name, region_uri, decal_uri, lang_code FROM lib_stage_battle INNER JOIN lib_stage_battle_lang AS tblFilter ON lib_stage_battle.battle_id = tblFilter.battle_id AND tblFilter.battle_uri = ? INNER JOIN lib_stage_battle_lang ON lib_stage_battle.battle_id = lib_stage_battle_lang.battle_id INNER JOIN sys_lang on lib_stage_battle_lang.lang_id = sys_lang.lang_id INNER JOIN lib_stage_decal ON lib_stage_battle.decal_id = lib_stage_decal.decal_id INNER JOIN lib_region_lang ON lib_stage_battle.region_id = lib_region_lang.region_id AND lib_region_lang.lang_id = lib_stage_battle_lang.lang_id',[request.params.stage], function (error, results, fields) {
				if (error) reject(error);
				
				results.forEach(function(rsQuery){
					if (rsQuery.lang_code == detailPage.lang) {
						detailRequest.battle = {
						name:rsQuery.battle_name,
						uri:rsQuery.battle_uri,
						desc:rsQuery.battle_desc,
						attr:[rsQuery.battle_epic, rsQuery.battle_char, rsQuery.battle_star],
						challenge: rsQuery.battle_challenge,
						asset:rsQuery.decal_uri,
						region:[rsQuery.region_name, rsQuery.region_uri]};
					}
					detailPage.uri[rsQuery.lang_code] += rsQuery.battle_uri;
				})
				
				detailPage.meta.heading = detailPage.meta.heading.replace('[STAGENAME]',detailRequest.battle.name);
				detailPage.meta.title = detailPage.meta.title.replace('[STAGENAME]',detailRequest.battle.name);
				detailPage.meta.desc = detailPage.meta.desc.replace('[STAGENAME]',detailRequest.battle.name);

				resolve(true);
			})
		})
	}

	dataOpen().then((cnx) => {
		Promise.all([setDetailPage(), queryStage(cnx)]).then(() => {
			Promise.all([dataClose(cnx)]).then(() => {
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

  