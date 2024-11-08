import re
import sys

# Function to escape HTML special characters


def escape_html(code):
    return (code.replace('<', '&lt;')
                .replace('>', '&gt;')
                .replace('"', '&quot;')
                .replace("'", '&apos;'))

# Function to process the HTML file


def process_html(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as file:
        html_content = file.read()

    # Regular expression to find <code> sections and replace their content
    def replace_code(match):
        code_content = match.group(1)
        escaped_code = escape_html(code_content)
        return f"<code>{escaped_code}</code>"

    # Replace all <code>...</code> sections with escaped content
    updated_html_content = re.sub(
        r'<code>(.*?)</code>', replace_code, html_content, flags=re.DOTALL)

    # Write the modified content to the output file
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(updated_html_content)

# Main function to run the script


def main():
    if len(sys.argv) != 3:
        print("Usage: python3 escape_code_in_html.py <input_html_file> <output_html_file>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    process_html(input_file, output_file)
    print(f"Processed HTML has been saved to: {output_file}")


if __name__ == "__main__":
    main()
