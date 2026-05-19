use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

struct ApiProcess(Mutex<Option<CommandChild>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(ApiProcess(Mutex::new(None)))
        .setup(|app| {
            // Only auto-launch the sidecar in production builds.
            // In dev mode the user starts the backend manually via start.ps1.
            #[cfg(not(debug_assertions))]
            {
                let handle = app.handle().clone();
                let sidecar = handle
                    .shell()
                    .sidecar("aristotle-api")
                    .expect("aristotle-api sidecar not found in bundle");
                let (_rx, child) = sidecar.spawn().expect("failed to start aristotle-api");
                *app.state::<ApiProcess>().0.lock().unwrap() = Some(child);
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Kill the API backend when the window is closed
                if let Some(child) = window
                    .app_handle()
                    .state::<ApiProcess>()
                    .0
                    .lock()
                    .unwrap()
                    .take()
                {
                    let _ = child.kill();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
