// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use if_addrs::get_if_addrs;
use serde::Serialize;

#[derive(Serialize)]
struct IfaceIp {
  iface: String,
  ip: String,
}

#[tauri::command]
fn list_local_ips() -> Result<Vec<IfaceIp>, String> {
  let addrs = get_if_addrs().map_err(|e| e.to_string())?;

  let mut out = Vec::new();
  for a in addrs {
    let is_loopback = a.is_loopback();
    let ip = a.ip().to_string(); // ambil dulu sebelum move name

    if is_loopback {
      continue;
    }

    out.push(IfaceIp {
      iface: a.name, // move terjadi terakhir
      ip,
    });
  }

  Ok(out)
}


fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![list_local_ips])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
