mod secret;
use mongodb::{bson::doc, options::ClientOptions, Client};
#[tokio::main]
    async fn main() -> mongodb::error::Result<()> {
        let client_options = ClientOptions::parse(
            secret::secret(),
        )
        .await?;
        let client = Client::with_options(client_options)?;
        let geoguessr = client.database("geoguessr");
        for collection_name in geoguessr.list_collection_names(None).await? {
            println!("{}", collection_name);
        }

        Ok(())
    }