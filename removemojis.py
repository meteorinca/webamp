#!/usr/bin/env python3
import sys


ASCII_EMOTICONS = (
    ":-)", ":)", ":-(", ":(", ":-D", ":D",
    ";-)", ";)", ":P", ":-P", ":p", ":-p",
    ":'(", ":/", ":-/", ":|", ":-|",
    "<3", "</3", "XD", "xD",
)


def is_emoji_character(ch):
    code = ord(ch)

    return (
        0x1F000 <= code <= 0x1FAFF or  # Most modern emoji blocks
        0x2600 <= code <= 0x27BF or    # Symbols, dingbats
        0x1F1E6 <= code <= 0x1F1FF or  # Flag letters
        0xFE00 <= code <= 0xFE0F or    # Emoji variation selectors
        code == 0x200D or              # Zero-width joiner
        code == 0x20E3                 # Keycap combining mark
    )


def remove_emojis(text):
    cleaned = "".join(ch for ch in text if not is_emoji_character(ch))

    for emoticon in ASCII_EMOTICONS:
        cleaned = cleaned.replace(emoticon, "")

    return cleaned


def main():
    if len(sys.argv) not in (2, 3):
        program = sys.argv[0]
        print(f"Usage: {program} INPUT_FILE [OUTPUT_FILE]", file=sys.stderr)
        print(f"Example: {program} testfile.txt", file=sys.stderr)
        print(f"Example: {program} testfile.txt cleaned.txt", file=sys.stderr)
        print(f"Example: {program} testfile.txt -", file=sys.stderr)
        sys.exit(2)

    input_path = sys.argv[1]

    if len(sys.argv) == 3:
        output_path = sys.argv[2]
    else:
        output_path = input_path + ".cleaned.txt"

    try:
        with open(input_path, "r", encoding="utf-8") as source:
            original = source.read()
    except OSError as exc:
        print(f"Could not read {input_path!r}: {exc}", file=sys.stderr)
        sys.exit(1)

    cleaned = remove_emojis(original)

    if output_path == "-":
        sys.stdout.write(cleaned)
        return

    try:
        with open(output_path, "w", encoding="utf-8", newline="") as destination:
            destination.write(cleaned)
    except OSError as exc:
        print(f"Could not write {output_path!r}: {exc}", file=sys.stderr)
        sys.exit(1)

    print(f"Cleaned file written to: {output_path}")


if __name__ == "__main__":
    main()