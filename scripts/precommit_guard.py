"""pre-commit 守卫：扫描本次暂存改动里的硬伤（密钥/硬编码路径/.env/大文件）。

只检查 pre-commit 传入的暂存文件，不全仓扫描（避免被存量债拖累）。
跨平台（纯 Python，Windows/Mac/Linux 通用）。命中即阻断提交（exit 1）。

用法（由 .pre-commit-config.yaml 调用）：
    python scripts/precommit_guard.py <file1> <file2> ...
"""

import re
import sys
from pathlib import Path

# Windows 默认 GBK 控制台无法输出部分字符，强制 UTF-8 避免 UnicodeEncodeError。
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# 大文件阈值（字节）。dump/tar/构建产物等不该进仓库。
MAX_BYTES = 2 * 1024 * 1024  # 2 MB

# 真密钥模式（明文赋值）。占位符/读环境变量的写法会被白名单放过。
SECRET_PATTERNS = [
    re.compile(r"(FEISHU_[A-Z_]*SECRET|MOONSHOT_API_KEY|SECRET_KEY)\s*=\s*['\"]?[A-Za-z0-9_\-]{16,}"),
    re.compile(r"\bsk-[A-Za-z0-9]{20,}\b"),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
]
# 白名单：占位符 / 从配置读取 / 示例，命中这些则不算泄露。
SECRET_ALLOW = re.compile(
    r"YOUR_|your-|change-me|example|placeholder|xxx|REMOVED|<|getenv|os\.environ|settings\.|process\.env|requiredEnv|optionalEnv",
    re.IGNORECASE,
)

# 硬编码绝对路径（Windows 盘符）。配置/路径应走环境变量。
HARDCODED_PATH = re.compile(r"['\"][a-zA-Z]:[/\\][^'\"]*['\"]")

# 不该提交的文件名。
BANNED_NAMES = re.compile(r"(^\.env$|/\.env$|\.env\.[^/]*$)")
BANNED_ALLOW = re.compile(r"\.env\.example$")

TEXT_SUFFIXES = {".py", ".ts", ".tsx", ".js", ".jsx", ".sh", ".md", ".yml", ".yaml", ".env", ".txt", ".json"}


def main(files: list[str]) -> int:
    problems: list[str] = []
    for f in files:
        p = Path(f)
        if not p.exists():
            continue
        # 1. 文件名禁忌（.env 不能提交，.env.example 放行）
        if BANNED_NAMES.search(f.replace("\\", "/")) and not BANNED_ALLOW.search(f):
            problems.append(f"[.env 禁止提交] {f} —— 真实配置只放本地，已在 .gitignore")
            continue
        # 2. 大文件
        if p.stat().st_size > MAX_BYTES:
            mb = p.stat().st_size / 1024 / 1024
            problems.append(f"[大文件] {f} ({mb:.1f}MB > 2MB) —— dump/构建产物不该进仓库")
            continue
        # 3. 文本内容扫描
        if p.suffix.lower() not in TEXT_SUFFIXES:
            continue
        try:
            lines = p.read_text(encoding="utf-8", errors="ignore").splitlines()
        except OSError:
            continue
        for i, line in enumerate(lines, 1):
            if SECRET_ALLOW.search(line):
                continue
            for pat in SECRET_PATTERNS:
                if pat.search(line):
                    problems.append(f"[疑似真密钥] {f}:{i} —— 用环境变量，别写明文")
                    break
            if HARDCODED_PATH.search(line):
                problems.append(f"[硬编码绝对路径] {f}:{i} —— 走配置/环境变量，别写死盘符")

    if problems:
        print("\n❌ pre-commit 守卫拦截（修掉后重新提交）：\n")
        for p_ in problems:
            print("  " + p_)
        print("\n确属误报？本次可加 --no-verify 跳过，但请确认无误。\n")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
