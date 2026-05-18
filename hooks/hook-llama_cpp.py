from PyInstaller.utils.hooks import collect_dynamic_libs, collect_data_files

# Bundle the native llama.dll / libllama.so and any other native libs
binaries = collect_dynamic_libs("llama_cpp")
datas    = collect_data_files("llama_cpp")
