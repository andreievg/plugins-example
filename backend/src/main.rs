use std::{fs, path::PathBuf};

use actix_cors::Cors;
use actix_files::NamedFile;
use actix_web::{get, web, App, HttpServer, Responder};
use serde_json::json;

#[get("/plugin/list")]
async fn plugin_list() -> impl Responder {
    let paths = fs::read_dir("./plugins")
        .unwrap()
        .into_iter()
        .map(|p| p.unwrap())
        .filter(|p| p.file_type().unwrap().is_dir())
        .map(|p| p.file_name().to_string_lossy().to_string())
        .collect::<Vec<String>>();

    let json = json!(paths);
    web::Json(json)
}

#[get("/plugin/{plugin}/{filename}")]
async fn plugin_files(path: web::Path<(String, String)>) -> impl Responder {
    let (plugin_name, filename) = path.into_inner();
    let path: PathBuf = ["./plugins", &plugin_name, &filename].iter().collect();
    NamedFile::open(path).unwrap()
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(plugin_list)
            .service(plugin_files)
            .wrap(Cors::permissive())
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
