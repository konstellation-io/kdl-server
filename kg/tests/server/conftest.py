import sys
from pathlib import Path

server = Path(Path.cwd(), 'src/server')
sys.path.append(str(server))
