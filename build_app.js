const fs = require('fs');
const path = require('path');

const jsxPath = path.resolve(__dirname, 'app/static/app.jsx');
const jsPath = path.resolve(__dirname, 'app/static/app.js');
const babelPath = path.resolve(__dirname, 'app/static/vendor/babel.min.js');

let code = fs.readFileSync(jsxPath, 'utf8');

// Ensure (> 0) is escaped
code = code.replace('(> 0 ₽)', '(&gt; 0 ₽)');

// Add ErrorBoundary if missing
if (!code.includes('class ErrorBoundary')) {
  const eb = `
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('GroceryPOS Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800 rounded-2xl p-6 max-w-md text-center shadow-2xl">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-rose-400 mb-2">Произошла ошибка интерфейса</h2>
            <p className="text-xs text-slate-400 mb-4">{this.state.error ? this.state.error.message : 'Неизвестная ошибка'}</p>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
            >
              Сбросить кэш и перезагрузить
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
`;

  code = code.replace(
    "ReactDOM.createRoot(document.getElementById('root')).render(<App />);",
    eb + "\nconst rootEl = document.getElementById('root');\nif (rootEl) {\n  ReactDOM.createRoot(rootEl).render(<ErrorBoundary><App /></ErrorBoundary>);\n}"
  );

  fs.writeFileSync(jsxPath, code, 'utf8');
}

const Babel = require(babelPath);
const result = Babel.transform(code, {
  presets: [['react', { runtime: 'classic' }]]
});

fs.writeFileSync(jsPath, result.code, 'utf8');
console.log('Successfully compiled app.jsx to app.js! Size:', result.code.length);
