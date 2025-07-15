export function ThemeScript() {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `
          try {
            var theme = localStorage.getItem('theme');
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch(e) {}
        `,
            }}
        />
    );
} 