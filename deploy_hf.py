#!/usr/bin/env python3
"""GroceryStore POS - Hugging Face Spaces Deployment & Sync Tool
Deploys or synchronizes the project to Hugging Face Spaces (Docker SDK).
Supports huggingface_hub API and Git HTTPS fallback.
"""

import os
import sys
import argparse
import subprocess
import shutil
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

def resolve_project_dir(cli_path: str | None = None) -> Path:
    if cli_path:
        p = Path(cli_path).resolve()
        if p.exists() and p.is_dir():
            return p
    # If run inside projects/grocery_pos
    current = Path(__file__).resolve().parent
    if (current / "app").exists() and (current / "Dockerfile").exists():
        return current
    # If run from factory root
    fallback = Path.cwd() / "projects" / "grocery_pos"
    if (fallback / "app").exists():
        return fallback
    return current

def check_huggingface_hub():
    try:
        import huggingface_hub
        return True
    except ImportError:
        return False

def deploy_via_hf_hub(repo_id: str, token: str, project_dir: Path, private: bool = False, include_db: bool = False):
    from huggingface_hub import HfApi

    print(f"\n[*] Подключение к Hugging Face API с токеном...")
    api = HfApi(token=token)

    # 1. Проверка авторизации
    try:
        user_info = api.whoami()
        username = user_info.get("name", "Unknown")
        print(f"[+] Авторизация успешна! Пользователь: {username}")
    except Exception as e:
        print(f"[!] Ошибка авторизации Hugging Face: {e}")
        print("[!] Проверьте правильность токена (требуются права Write).")
        return False

    # 2. Создание или верификация Space
    print(f"[*] Проверка репозитория Space: {repo_id}...")
    try:
        api.create_repo(
            repo_id=repo_id,
            repo_type="space",
            space_sdk="docker",
            private=private,
            exist_ok=True
        )
        print(f"[+] Репозиторий Space '{repo_id}' готов (SDK: docker).")
    except Exception as e:
        print(f"[!] Предупреждение при проверке Space: {e}")

    # 3. Формирование списка игнорируемых файлов
    ignore_patterns = [
        "__pycache__/*",
        "*.pyc",
        "*.pyo",
        "*.pyd",
        ".pytest_cache/*",
        ".venv/*",
        "venv/*",
        "env/*",
        ".git/*",
        "backups/*",
        "*.bat",
        "deploy_hf.py",
        "DEPLOY_HF_GUIDE.md",
        "android_app/**"
    ]
    if not include_db:
        ignore_patterns.extend(["*.db", "*.db-journal", "*.db-wal", "*.db-shm"])

    print(f"[*] Загрузка файлов из: {project_dir}")
    print(f"    (Исключены временные файлы, кэш и локальные дампы)")

    try:
        commit_info = api.upload_folder(
            folder_path=str(project_dir),
            repo_id=repo_id,
            repo_type="space",
            commit_message="Deploy GroceryStore POS to HF Spaces (Docker SDK)",
            ignore_patterns=ignore_patterns
        )
        print(f"\n[+] Успешно загружено! Коммит: {commit_info}")
        return True
    except Exception as e:
        print(f"[!] Ошибка при загрузке файлов: {e}")
        return False

def deploy_via_git(repo_id: str, token: str, project_dir: Path, include_db: bool = False):
    print("\n[*] Использование Git HTTPS для синхронизации со Space...")
    git_bin = shutil.which("git")
    if not git_bin:
        print("[!] Git не найден в системе. Установите huggingface_hub: pip install huggingface_hub")
        return False

    import tempfile
    temp_dir = tempfile.mkdtemp(prefix="hf_space_")
    remote_url = f"https://user:{token}@huggingface.co/spaces/{repo_id}"

    try:
        print(f"[*] Клонирование репозитория Space во временную папку...")
        subprocess.run([git_bin, "clone", remote_url, temp_dir], check=True, capture_output=True)

        # Копирование файлов проекта
        for item in project_dir.iterdir():
            if item.name in (".git", "__pycache__", ".pytest_cache", ".venv", "venv", "backups", "deploy_hf.py", "DEPLOY_HF_GUIDE.md") or item.name.endswith(".bat"):
                continue
            if not include_db and item.name.endswith((".db", ".db-journal")):
                continue

            dest = Path(temp_dir) / item.name
            if item.is_dir():
                if dest.exists():
                    shutil.rmtree(dest)
                shutil.copytree(item, dest)
            else:
                shutil.copy2(item, dest)

        # Git commit & push
        subprocess.run([git_bin, "add", "-A"], cwd=temp_dir, check=True)
        status_out = subprocess.run([git_bin, "status", "--porcelain"], cwd=temp_dir, capture_output=True, text=True)
        if not status_out.stdout.strip():
            print("[+] Изменений для отправки нет. Space уже синхронизирован!")
            return True

        subprocess.run([git_bin, "commit", "-m", "Deploy GroceryStore POS via Git HTTPS"], cwd=temp_dir, check=True)
        subprocess.run([git_bin, "push", "origin", "main"], cwd=temp_dir, check=True)
        print("[+] Успешно отправлено через Git HTTPS!")
        return True
    except subprocess.CalledProcessError as err:
        print(f"[!] Ошибка выполнения Git: {err}")
        return False
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

def main():
    parser = argparse.ArgumentParser(
        description="Деплой и синхронизация GroceryStore POS в Hugging Face Spaces (Docker SDK)."
    )
    parser.add_argument(
        "--repo-id",
        type=str,
        default=os.getenv("HF_SPACE_ID") or os.getenv("HF_REPO_ID"),
        help="Идентификатор Space в формате 'username/spacename' (или переменная HF_SPACE_ID)"
    )
    parser.add_argument(
        "--token",
        type=str,
        default=os.getenv("HF_TOKEN") or os.getenv("HUGGING_FACE_HUB_TOKEN"),
        help="Hugging Face токен с правами Write (или переменная HF_TOKEN)"
    )
    parser.add_argument(
        "--private",
        action="store_true",
        help="Сделать Space приватным при создании"
    )
    parser.add_argument(
        "--include-db",
        action="store_true",
        help="Загрузить локальный файл grocery_pos.db в Space (по умолчанию исключен)"
    )
    parser.add_argument(
        "--dir",
        type=str,
        default=None,
        help="Путь к исходной папке проекта (по умолчанию директория grocery_pos)"
    )
    parser.add_argument(
        "--use-git",
        action="store_true",
        help="Принудительно использовать Git HTTPS вместо huggingface_hub"
    )

    args = parser.parse_args()

    print("=" * 64)
    print("   🚀 GROCERY STORE POS — ДЕПЛОЙ НА HUGGING FACE SPACES   ")
    print("=" * 64)

    project_dir = resolve_project_dir(args.dir)
    print(f"[*] Директория проекта: {project_dir}")

    # Проверка наличия ключевых файлов
    required_files = ["Dockerfile", "README.md", "requirements.txt", "app"]
    for req in required_files:
        if not (project_dir / req).exists():
            print(f"[!] Ошибка: Не найден обязательный файл/каталог: {req}")
            sys.exit(1)

    repo_id = args.repo_id
    if not repo_id:
        repo_id = input("[?] Введите ID Space (например, myusername/grocerystore-pos): ").strip()
        if not repo_id:
            print("[!] Ошибка: ID Space обязателен для развертывания.")
            sys.exit(1)

    token = args.token
    if not token:
        token = input("[?] Введите Hugging Face токен (hf_...): ").strip()
        if not token:
            print("[!] Ошибка: Токен Hugging Face обязателен для развертывания.")
            sys.exit(1)

    has_hub = check_huggingface_hub()
    success = False

    if has_hub and not args.use_git:
        success = deploy_via_hf_hub(
            repo_id=repo_id,
            token=token,
            project_dir=project_dir,
            private=args.private,
            include_db=args.include_db
        )
    else:
        if not has_hub:
            print("[*] Библиотека huggingface_hub не установлена, переключение на Git HTTPS...")
        success = deploy_via_git(
            repo_id=repo_id,
            token=token,
            project_dir=project_dir,
            include_db=args.include_db
        )

    if success:
        user_part, space_part = repo_id.split("/") if "/" in repo_id else (repo_id, repo_id)
        space_url = f"https://huggingface.co/spaces/{repo_id}"
        direct_app_url = f"https://{user_part.lower()}-{space_part.lower().replace('_', '-')}.hf.space"

        print("\n" + "=" * 64)
        print("   ✅ ДЕПЛОЙ УСПЕШНО ЗАВЕРШЕН!")
        print("=" * 64)
        print(f"[*] Страница Space на Hugging Face: {space_url}")
        print(f"[*] Прямая ссылка на кассу (PWA):   {direct_app_url}")
        print(f"[*] Документация API:               {direct_app_url}/docs")
        print(f"[*] Скачивание бэкапа базы:         {direct_app_url}/api/backup")
        print("-" * 64)
        print("ℹ️ Совет: Включите 'Persistent Storage' (/data) в настройках Space (Settings),")
        print("   чтобы база данных сохранялась постоянно между перезапусками.")
        print("=" * 64 + "\n")
    else:
        print("\n[!] Деплой завершился с ошибкой. См. лог выше.")
        sys.exit(1)

if __name__ == "__main__":
    main()
