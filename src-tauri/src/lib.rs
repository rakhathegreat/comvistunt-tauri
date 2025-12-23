// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    return format!("Hello, {}! You've been greeted from Rust!", name);
}

#[tauri::command]
fn hello_world() -> () {
    println!("Hello, world!");
}

#[tauri::command]
fn test_print() -> () {
    println!("Goblok!");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, hello_world, test_print])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
