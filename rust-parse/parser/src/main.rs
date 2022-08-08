mod secret;
use mongodb::bson::Document;
use mongodb::Collection;
use mongodb::{options::ClientOptions, Client};
// use futures::stream::{ TryStreamExt};
//use serde::{Serialize, Deserialize};
//use std::sync::Arc;
//use std::io;
//use std::process;
use std::error::Error;

struct Coordinates {
    lat: f64,
    lng: f64,
}

fn write_all_points(coords: Vec<Coordinates>) -> Result<(), Box<dyn Error>> {
    let file_path = String::from("./output.csv");
    let mut wtr = csv::Writer::from_path(file_path)?;
    // When writing records without Serde, the header record is written just
    // like any other record.
    wtr.write_record([String::from("lat"), String::from("lng")])?;
    for coord in coords {
        wtr.write_record([coord.lat.to_string(), coord.lng.to_string()])?;
    }

    wtr.flush()?;
    Ok(())
}

#[tokio::main]
async fn main() -> mongodb::error::Result<()> {
    let mut coord_vector: Vec<Coordinates> = Vec::new();

    std::env::set_var("RUST_BACKTRACE", "1");

    let client_options = ClientOptions::parse(secret::secret()).await?;
    let client = Client::with_options(client_options)?;
    let geoguessr = client.database("geoguessr");

    let games = geoguessr.collection::<Document>("games");

    let mut all_documents = Collection::find(&games, None, None).await?;

    while all_documents.advance().await? {
        let deserialized = all_documents.deserialize_current()?;

        //println!("{:?}", deserialized);
        println!(" ");
        let mut game_id: String = String::from("");
        let mut document_result: bson::Document = bson::Document::new();
        let stored_document = bson::Document::get_document(&deserialized, String::from("document"));

        match stored_document {
            Ok(v) => {
                document_result = bson::Document::clone(v);
            }
            Err(e) => {
                println!("{}", e);
                continue;
            }
        }
        //println!("{:?}", document_result);
        let game_id_result = bson::Document::get_str(&document_result, String::from("gameid"));
        match game_id_result {
            Ok(v) => {
                game_id = String::from(v);
            }
            Err(e) => {
                println!("{}", e);
                continue;
            }
        }
        println!("{}", game_id);
        println!(" ");
        let sub_doc = bson::Document::get_array(&document_result, game_id).unwrap();
        //println!("{:?}", sub_doc);
        for element in sub_doc {
            let doc_doc: bson::Document = bson::to_document(&element).unwrap();
            let lat = bson::Document::get_f64(&doc_doc, String::from("lat")).unwrap();
            let lng = bson::Document::get_f64(&doc_doc, String::from("lng")).unwrap();
            println!("{:?}", lat);
            println!("{:?}", lng);
            let point = Coordinates { lat: lat, lng: lng };
            coord_vector.push(point);
        }
    }
    let write_result = write_all_points(coord_vector);
    match write_result {
        Ok(_v) => {
            println!("worked");
        }
        Err(_e) => {
            println!("didn't work");
        }
    }
    Ok(())
}
