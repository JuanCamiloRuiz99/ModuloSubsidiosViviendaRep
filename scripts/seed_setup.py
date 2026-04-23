import os
import sys


def setup_django_path():
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend'))
    normalized_target = backend_dir

    def normalize(path):
        if not path:
            return os.path.abspath('.')
        return os.path.abspath(path)

    sys.path[:] = [p for p in sys.path if normalize(p) != normalized_target]
    sys.path.insert(0, normalized_target)
