//INSCRIPTION CLIENT
//PANIER
//MODE DE RECHERCHE MULTI CRITERES

const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methodes', 'GET,POST,PUT,DELETE');
	res.setHeader('Access-Control-Allow-Headers', '*');
	next();
});

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = "mongodb://localhost:27017";

MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {

	let db = client.db("eCommerce");





	//----------------------------------------------------------------------------------------------------------------------//
	//												   PRODUITS                             								//	

	app.get("/produits", (req, res) => {
		try {
			db.collection("produits").find().sort({marque : 1}).toArray((err, documents) => {
				res.end(JSON.stringify(documents));
			});
		} catch (e) {
			console.log("Erreur sur /produits : " + e);
		}
	});


	app.get("/produits/modele/:modele", (req, res) => {

		let i = req.params.modele;
		try {
			db.collection("produits").find({ modele: i }).toArray((err, documents) => {
				res.end(JSON.stringify(documents));
			});
		} catch (e) {
			console.log("Erreur sur /produits/" + i + " : " + e);
		}

	});

	app.get("/produits/marque/:marque", (req, res) => {
		let m = req.params.marque;
		try {
			db.collection("produits").find({ marque: m }).toArray((err, documents) => {
				res.end(JSON.stringify(documents));
			});
		} catch (e) {
			console.log("Erreur sur /produits/" + m + " : " + e);
		}

	});

	app.get("/produits/typeP/:typeP", (req, res) => {

		let t = req.params.typeP;
		try {
			db.collection("produits").find({ typeP: t }).toArray((err, documents) => {
				res.end(JSON.stringify(documents));
			});
		} catch (e) {
			console.log("Erreur sur /produits/" + t + " : " + e);
		}

	});

	app.get("/produits/genre/:genre", (req, res) => {

		let g = req.params.genre;
		try {
			db.collection("produits").find({ genre: g }).toArray((err, documents) => {
				res.end(JSON.stringify(documents));
			});
		} catch (e) {
			console.log("Erreur sur /produits/" + g + " : " + e);
		}

	});


	app.get("/produits/recherche/:marque/:prixMin/:prixMax/:genre/:type", (req, res) => {
		let marque = req.params.marque;
		let prixMin = req.params.prixMin;
		let prixMax = req.params.prixMax;
		let genre = req.params.genre;
		let type = req.params.type;

		let o = {}

		if(prixMin != "*" || prixMax != "*" ){
			o.prix = {}
			if(prixMin != "*"){
				o.prix['$gte'] = parseInt(prixMin);
			}
			if(prixMax != "*"){
				o.prix['$lte'] = parseInt(prixMax);
			}
		}
		
		if(marque != "*"){
			o.marque=marque;
		}
		if(genre!="*"){
			o.genre=genre;
		}	
		if(type!="*"){
			o.type=type;
		}

		try {
			db.collection("produits").find(o).sort({marque:1}).toArray((err, documents) => {
				res.end(JSON.stringify(documents));
			});
		} catch (e) {
			console.log("Erreur sur /produits/" + o + " : " + e);
		}

	});


	//----------------------------------------------------------------------------------------------------------------------//
	//												   MEMBRES                             									//

	app.get("/membres", (req, res) => {
		try {
			db.collection("membres").find().toArray((err, documents) => {
				res.end(JSON.stringify(documents));
			});
		} catch (e) {
			console.log("Erreur sur /membres : " + e);
		}
	});


	/* connexion */

	app.post("/membres/connexion", (req, res) => {
		console.log("/membres/connexion avec " + JSON.stringify(req.body));
		try {
			db.collection("membres")
				.find(req.body)
				.toArray((err, documents) => {
					if (documents.length == 1) {
						res.end(JSON.stringify({ "resultat": 1, "message": "Authentification réussie" }));
					} else {
						res.end(JSON.stringify({ "resultat": 0, "message": "Email et/ou mot de passe incorrect" }));
					}
				});
		} catch (e) {
			res.end(JSON.stringify({ "resultat": 0, "message": e }));
		}
		//Creation panier 

		try {
			db.collection('paniers').find({ "email": req.body.email }).toArray((err, documents) => {
				if (documents.length >= 1) {
				}
				else {
					db.collection("paniers").insertOne({ "email": req.body.email, "listeProduits": [] });
				}
			});

		} catch (e) {
			res.end(JSON.stringify({ "resultat": 0, "message": e }));
		}
	});





	/* inscription */

	app.post("/membres/inscription", (req, res) => {

		try {
			db.collection("membres")
				.find({ "email": req.body.email })
				.toArray((err, documents) => {
					console.log(documents.length);
					if (documents.length >= 1) {
						res.end(JSON.stringify({ "resultat": 1, "message": "Email déjà utilisé" }));
					} else {
						console.log("/membres/inscription avec " + JSON.stringify(req.body));
						try {
							db.collection("membres").insertOne(req.body);
							res.end(JSON.stringify({ "resultat": 0}));
						} catch (e) {
							res.end(JSON.stringify({ "resultat": 0, "message": e }));
						}

						try {
							db.collection('paniers').find({ "email": req.body.email }).toArray((err, documents) => {
								if (documents.length >= 1) {
									res.end(JSON.stringify({ "resultat": 0}));
								}
								else {
									db.collection("paniers").insertOne({ "email": req.body.email, "listeProduits": [] });
									res.end(JSON.stringify({ "resultat": 0}));
								}
							});
				
						} catch (e) {
							res.end(JSON.stringify({ "resultat": 0, "message": e }));
						}
					}
				});
		} catch (e) {
			res.end(JSON.stringify({ "resultat": 0, "message": e }));
		}
	});


	app.get("/membres/deconnexion/:email", (req, res) => {
		let mail = req.params.email;
		try {
			console.log("membres/deconnexion avec " + JSON.stringify(mail));
			db.collection("paniers").deleteOne({ email: mail });
		} catch (e) {
			console.log("ERROR");
		}
	});



	//----------------------------------------------------------------------------------------------------------------------//
	//												   PANIERS                             									//

	app.get("/paniers/:email", (req, res) => {
		let e = req.params.email;
		try {
			db.collection("paniers").find({ email: e }).project({ listeProduits: 1, _id: 0 }).toArray((err, documents) => {

				res.end(JSON.stringify(documents));
			});
		} catch (e) {
			console.log("Erreur sur /paniers : " + e);
		}
	});

	app.get("/paniers/supprimer/:modele/:email", (req, res) => {
		let m = req.params.modele;
		let e = req.params.email;
		let tampon = new Array();

		try {
			db.collection("paniers").find({ "email": e }).toArray((err, documents) => {
				let listeP = documents[0].listeProduits;
				listeP.forEach(function (element) {
					if (element.modele != m) {
						tampon.push(element);
					}
				});

				db.collection("paniers").update({ "email": e }, { $set: { "listeProduits": tampon } });
			});
			documents[0].listeProduits = tampon;
			res.end(JSON.stringify(documents));

		} catch (e) {
			res.end(JSON.stringify({ "resultat": 0, "message": e }));
		}
	});


	app.get("/paniers/modifier/:modele/:quantite/:email", (req, res) => {
		let m = req.params.modele;
		let q = req.params.quantite;
		let e = req.params.email;

		try {
			db.collection("paniers").find({ "email": e }).toArray((err, documents) => {
				let listeP = documents[0].listeProduits;
				listeP.forEach(function (element) {

					if (element.modele == m) {
						element.quantite = q;
					}
				});
				db.collection("paniers").update({ "email": e }, { $set: { "listeProduits": listeP } });
			});
			res.end(JSON.stringify(documents));
		} catch (e) {
			res.end(JSON.stringify({ "resultat": 0, "message": e }));

		}
	});



	app.get("/paniers/ajouter/:modele/:marque/:genre/:prix/:img/:quantite/:email", (req, res) => {
		let mod = req.params.modele;
		let m = req.params.marque;
		let g = req.params.genre;
		let p = req.params.prix;
		let e = req.params.email;
		let i = req.params.img;
		let q = req.params.quantite;

		var produit = new Object();
		produit.modele = mod;
		produit.marque = m;
		produit.genre = g;
		produit.prix = p;
		produit.img = i;
		produit.quantite = q;
		
		try {
			db.collection("paniers").find({ "email": e }).toArray((err, documents) => {
				let listeProduits = documents[0].listeProduits;
				let boolAjout = 1;
				listeProduits.forEach(function (element) {

					if (element.modele == mod) {
						boolAjout = 0;
						element.quantite = parseInt(element.quantite) + parseInt(q);
					}
				});
				if (boolAjout == 1) {
					listeProduits.push(produit);
				}
				db.collection("paniers").update({ "email": e }, { $set: { "listeProduits": listeProduits } });
			});

			documents[0].listeProduits = listeProduits;
			res.end(JSON.stringify(documents));

		} catch (e) {
			res.end(JSON.stringify({ "resultat": 0, "message": e }));
		}
	});

	app.get("/paniers/get/:modele/:email", (req, res) => {
		let e = req.params.email;
		let m = req.params.modele;

		try {
			db.collection("produits").find({ modele: m }).toArray((err, documents) => {
				res.end(JSON.stringify(documents));
			});
		} catch (e) {
			res.end(JSON.stringify({ "resultat": 0, "message": e }));
		}

	});

	app.get("/paniers/valider/:email", (req, res) => {
		let e = req.params.email;

		try {
			db.collection("paniers").find({ "email": e }).toArray((err, documents) => {
				let listeP = [];

				db.collection("paniers").update({ "email": e }, { $set: { "listeProduits": listeP } });
			});
			res.end(JSON.stringify(documents));
		} catch (e) {
			res.end(JSON.stringify({ "resultat": 0, "message": e }));
		}
	});




}); // Fermeture serveur mongo


app.listen(8888);