import subprocess
import os

with open('backend.log', 'w') as f:
    f.write("Starting backend test...\n")
    try:
        process = subprocess.Popen(['python', 'src/server.py'], 
                                 stdout=f, 
                                 stderr=f, 
                                 text=True)
        f.write(f"Process started with PID: {process.pid}\n")
    except Exception as e:
        f.write(f"Failed to start process: {e}\n")
