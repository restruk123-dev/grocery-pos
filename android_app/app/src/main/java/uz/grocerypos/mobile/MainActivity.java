package uz.grocerypos.mobile;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.webkit.SslErrorHandler;
import android.net.http.SslError;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

public final class MainActivity extends Activity {
    private static final String APP_ORIGIN = "https://grocery-pos-app-71i1.onrender.com";
    private static final String APP_HOST = "grocery-pos-app-71i1.onrender.com";
    private static final int CAMERA_PERMISSION_REQUEST = 41;
    private static final int FILE_CHOOSER_REQUEST = 42;

    private WebView webView;
    private FrameLayout root;
    private LinearLayout offlinePanel;
    private ProgressBar progressBar;
    private boolean mainLoadFailed;
    private PermissionRequest pendingCameraRequest;
    private WebChromeClient.FileChooserParams pendingFileChooser;
    private ValueCallbackHolder fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window window = getWindow();
        window.setStatusBarColor(0xff064e3b);
        window.setNavigationBarColor(0xff020617);

        root = new FrameLayout(this);
        root.setBackgroundColor(0xff020617);
        webView = new WebView(this);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setBackgroundColor(0xff020617);
        root.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setMax(100);
        progressBar.setIndeterminate(true);
        FrameLayout.LayoutParams progressLayout = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, dp(3));
        progressLayout.topMargin = dp(3);
        root.addView(progressBar, progressLayout);
        createOfflinePanel();
        setContentView(root);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        CookieManager.getInstance().setAcceptCookie(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                mainLoadFailed = false;
                progressBar.setVisibility(View.VISIBLE);
                offlinePanel.setVisibility(View.GONE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
                if (!mainLoadFailed) offlinePanel.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    mainLoadFailed = true;
                    showOfflinePanel();
                }
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                mainLoadFailed = true;
                handler.cancel();
                showOfflinePanel();
            }

            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                showOfflinePanel();
                return true;
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                boolean trusted = "https".equalsIgnoreCase(uri.getScheme())
                        && APP_HOST.equalsIgnoreCase(uri.getHost());
                if (!trusted) {
                    Toast.makeText(MainActivity.this,
                            "Ссылка заблокирована: разрешён только сайт кассы", Toast.LENGTH_SHORT).show();
                }
                return !trusted;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> handleWebPermission(request));
            }

            @Override
            public void onProgressChanged(WebView view, int progress) {
                progressBar.setIndeterminate(false);
                progressBar.setProgress(progress);
                if (progress >= 100) progressBar.setVisibility(View.GONE);
                else progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public boolean onShowFileChooser(WebView view, android.webkit.ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (fileCallback != null) fileCallback.cancel();
                fileCallback = new ValueCallbackHolder(callback);
                Intent intent = params.createIntent();
                try {
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (Exception error) {
                    fileCallback.cancel();
                    fileCallback = null;
                    Toast.makeText(MainActivity.this, "Не удалось открыть выбор файла", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
        });

        if (savedInstanceState == null) {
            webView.loadUrl(APP_ORIGIN + "/");
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private void createOfflinePanel() {
        offlinePanel = new LinearLayout(this);
        offlinePanel.setOrientation(LinearLayout.VERTICAL);
        offlinePanel.setGravity(android.view.Gravity.CENTER);
        offlinePanel.setPadding(dp(28), dp(24), dp(28), dp(24));
        offlinePanel.setBackgroundColor(0xff020617);

        TextView icon = new TextView(this);
        icon.setText("🛒");
        icon.setTextSize(42);
        icon.setGravity(android.view.Gravity.CENTER);
        offlinePanel.addView(icon, new LinearLayout.LayoutParams(-1, -2));

        TextView title = new TextView(this);
        title.setText(localized("Касса временно недоступна", "Kassa vaqtincha ishlamayapti"));
        title.setTextColor(0xffffffff);
        title.setTextSize(20);
        title.setGravity(android.view.Gravity.CENTER);
        title.setPadding(0, dp(12), 0, dp(8));
        offlinePanel.addView(title, new LinearLayout.LayoutParams(-1, -2));

        TextView message = new TextView(this);
        message.setText(localized(
                "Проверьте интернет. Сервер магазина может запускаться после паузы. Повторите подключение через несколько секунд.",
                "Internetni tekshiring. Do‘kon serveri tanaffusdan so‘ng ishga tushayotgan bo‘lishi mumkin. Bir necha soniyadan keyin qayta urinib ko‘ring."));
        message.setTextColor(0xffcbd5e1);
        message.setTextSize(14);
        message.setGravity(android.view.Gravity.CENTER);
        offlinePanel.addView(message, new LinearLayout.LayoutParams(-1, -2));

        Button retry = new Button(this);
        retry.setText(localized("Повторить подключение", "Qayta ulanish"));
        retry.setOnClickListener(view -> webView.reload());
        LinearLayout.LayoutParams buttonLayout = new LinearLayout.LayoutParams(-1, -2);
        buttonLayout.topMargin = dp(20);
        offlinePanel.addView(retry, buttonLayout);

        offlinePanel.setVisibility(View.GONE);
        root.addView(offlinePanel, new FrameLayout.LayoutParams(-1, -1));
    }

    private void showOfflinePanel() {
        runOnUiThread(() -> {
            progressBar.setVisibility(View.GONE);
            offlinePanel.setVisibility(View.VISIBLE);
        });
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private String localized(String russian, String uzbek) {
        String language = getResources().getConfiguration().getLocales().get(0).getLanguage();
        return "uz".equalsIgnoreCase(language) ? uzbek : russian;
    }

    private void handleWebPermission(PermissionRequest request) {
        boolean trustedOrigin = request.getOrigin() != null
                && APP_HOST.equalsIgnoreCase(request.getOrigin().getHost());
        String[] resources = request.getResources();
        boolean cameraOnly = resources.length == 1
                && PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resources[0]);
        if (!trustedOrigin || !cameraOnly) {
            request.deny();
            return;
        }
        if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            request.grant(resources);
        } else {
            pendingCameraRequest = request;
            requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION_REQUEST);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != CAMERA_PERMISSION_REQUEST || pendingCameraRequest == null) return;
        PermissionRequest request = pendingCameraRequest;
        pendingCameraRequest = null;
        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
        } else {
            request.deny();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != FILE_CHOOSER_REQUEST || fileCallback == null) return;
        Uri[] result = resultCode == RESULT_OK && data != null
                ? WebChromeClient.FileChooserParams.parseResult(resultCode, data) : null;
        fileCallback.complete(result);
        fileCallback = null;
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (pendingCameraRequest != null) pendingCameraRequest.deny();
        if (fileCallback != null) fileCallback.cancel();
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }

    private static final class ValueCallbackHolder {
        private final android.webkit.ValueCallback<Uri[]> callback;
        private boolean completed;

        ValueCallbackHolder(android.webkit.ValueCallback<Uri[]> callback) { this.callback = callback; }
        void complete(Uri[] result) { if (!completed) { completed = true; callback.onReceiveValue(result); } }
        void cancel() { complete(null); }
    }
}
