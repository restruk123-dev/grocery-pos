package uz.grocerypos.mobile;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.text.InputType;
import android.view.View;
import android.view.Window;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.SslErrorHandler;
import android.net.http.SslError;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;

public final class MainActivity extends Activity {
    private static final String PREFS_NAME = "grocery_pos_prefs";
    private static final String KEY_SERVER_URL = "server_url";
    private static final String DEFAULT_ORIGIN = "https://grocery-pos-app-71i1.onrender.com";
    private static final int MEDIA_PERMISSION_REQUEST = 41;
    private static final int FILE_CHOOSER_REQUEST = 42;

    private WebView webView;
    private FrameLayout root;
    private LinearLayout offlinePanel;
    private ProgressBar progressBar;
    private boolean mainLoadFailed;
    private PermissionRequest pendingMediaRequest;
    private ValueCallbackHolder fileCallback;

    private String getConfiguredOrigin() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String saved = prefs.getString(KEY_SERVER_URL, DEFAULT_ORIGIN);
        if (saved == null || saved.trim().isEmpty()) return DEFAULT_ORIGIN;
        saved = saved.trim();
        while (saved.endsWith("/")) saved = saved.substring(0, saved.length() - 1);
        return saved;
    }

    private String getConfiguredHost() {
        try {
            Uri uri = Uri.parse(getConfiguredOrigin());
            return uri.getHost() != null ? uri.getHost() : "";
        } catch (Exception e) {
            return "";
        }
    }

    private boolean isTrustedHost(Uri uri) {
        if (uri == null || uri.getHost() == null) return false;
        String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase() : "";
        if (!"https".equals(scheme) && !"http".equals(scheme)) return false;
        return getConfiguredHost().equalsIgnoreCase(uri.getHost());
    }

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
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        CookieManager.getInstance().setAcceptCookie(true);

        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void openServerSettings() {
                runOnUiThread(() -> showServerConfigDialog());
            }
        }, "AndroidPOS");

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
                String scheme = uri.getScheme() != null ? uri.getScheme().toLowerCase() : "";
                String host = uri.getHost() != null ? uri.getHost().toLowerCase() : "";
                boolean isExternalAction = "tel".equals(scheme)
                        || "sms".equals(scheme)
                        || "smsto".equals(scheme)
                        || "mailto".equals(scheme)
                        || "tg".equals(scheme)
                        || "whatsapp".equals(scheme)
                        || (("https".equals(scheme) || "http".equals(scheme))
                            && ("t.me".equals(host) || "wa.me".equals(host) || "api.whatsapp.com".equals(host)));
                if (isExternalAction) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this,
                                localized("Нет приложения для открытия ссылки",
                                        "Havolani ochish uchun ilova topilmadi"),
                                Toast.LENGTH_SHORT).show();
                    }
                    return true;
                }
                boolean trusted = isTrustedHost(uri);
                if (!trusted) {
                    Toast.makeText(MainActivity.this,
                            localized("Ссылка заблокирована: разрешён только сайт кассы",
                                    "Havola bloklandi: faqat kassa serveriga ruxsat berilgan"),
                            Toast.LENGTH_SHORT).show();
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
                    Toast.makeText(MainActivity.this, "Fayl tanlab bo'lmadi", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
        });

        if (savedInstanceState == null) {
            webView.loadUrl(getConfiguredOrigin() + "/");
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    private void showServerConfigDialog() {
        EditText input = new EditText(this);
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        input.setText(getConfiguredOrigin());
        input.setHint("http://192.168.1.50:8000");

        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setPadding(dp(20), dp(12), dp(20), dp(8));
        TextView hint = new TextView(this);
        hint.setText(localized(
                "Введите адрес локального сервера магазина (например http://192.168.1.50:8000) или облачный URL:",
                "Do'kon serveri manzilini kiriting (masalan http://192.168.1.50:8000) yoki bulutli URL:"));
        hint.setTextSize(13);
        container.addView(hint);
        container.addView(input);

        new AlertDialog.Builder(this)
                .setTitle(localized("Адрес сервера POS", "POS Server manzili"))
                .setView(container)
                .setPositiveButton(localized("Сохранить и подключить", "Saqlash va ulanish"), (dialog, which) -> {
                    String newUrl = input.getText().toString().trim();
                    if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
                        newUrl = "http://" + newUrl;
                    }
                    while (newUrl.endsWith("/")) newUrl = newUrl.substring(0, newUrl.length() - 1);
                    getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
                            .edit()
                            .putString(KEY_SERVER_URL, newUrl)
                            .apply();
                    mainLoadFailed = false;
                    offlinePanel.setVisibility(View.GONE);
                    webView.loadUrl(newUrl + "/");
                })
                .setNeutralButton(localized("Сбросить", "Asl holat"), (dialog, which) -> {
                    getSharedPreferences(PREFS_NAME, MODE_PRIVATE)
                            .edit()
                            .putString(KEY_SERVER_URL, DEFAULT_ORIGIN)
                            .apply();
                    webView.loadUrl(DEFAULT_ORIGIN + "/");
                })
                .setNegativeButton(localized("Отмена", "Bekor qilish"), null)
                .show();
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
                "Проверьте интернет или Wi-Fi магазина. Можно также указать адрес локального компьютера (http://192.168.x.x:8000).",
                "Internet yoki do‘kon Wi-Fi tarmog‘ini tekshiring. Shuningdek mahalliy server manzilini (http://192.168.x.x:8000) kiritishingiz mumkin."));
        message.setTextColor(0xffcbd5e1);
        message.setTextSize(14);
        message.setGravity(android.view.Gravity.CENTER);
        offlinePanel.addView(message, new LinearLayout.LayoutParams(-1, -2));

        Button retry = new Button(this);
        retry.setText(localized("Повторить подключение", "Qayta ulanish"));
        retry.setOnClickListener(view -> webView.loadUrl(getConfiguredOrigin() + "/"));
        LinearLayout.LayoutParams buttonLayout = new LinearLayout.LayoutParams(-1, -2);
        buttonLayout.topMargin = dp(20);
        offlinePanel.addView(retry, buttonLayout);

        Button settingsBtn = new Button(this);
        settingsBtn.setText(localized("⚙️ Настроить адрес сервера", "⚙️ Server manzilini sozlash"));
        settingsBtn.setOnClickListener(view -> showServerConfigDialog());
        LinearLayout.LayoutParams settingsLayout = new LinearLayout.LayoutParams(-1, -2);
        settingsLayout.topMargin = dp(10);
        offlinePanel.addView(settingsBtn, settingsLayout);

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
        if (!isTrustedHost(request.getOrigin())) {
            request.deny();
            return;
        }
        String[] resources = request.getResources();
        List<String> neededAndroidPermissions = new ArrayList<>();
        boolean allValid = true;
        for (String res : resources) {
            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(res)) {
                if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                    neededAndroidPermissions.add(Manifest.permission.CAMERA);
                }
            } else if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(res)) {
                if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    neededAndroidPermissions.add(Manifest.permission.RECORD_AUDIO);
                }
            } else {
                allValid = false;
            }
        }
        if (!allValid || resources.length == 0) {
            request.deny();
            return;
        }
        if (neededAndroidPermissions.isEmpty()) {
            request.grant(resources);
        } else {
            pendingMediaRequest = request;
            requestPermissions(neededAndroidPermissions.toArray(new String[0]), MEDIA_PERMISSION_REQUEST);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != MEDIA_PERMISSION_REQUEST || pendingMediaRequest == null) return;
        PermissionRequest request = pendingMediaRequest;
        pendingMediaRequest = null;
        boolean allGranted = grantResults.length > 0;
        for (int res : grantResults) {
            if (res != PackageManager.PERMISSION_GRANTED) {
                allGranted = false;
                break;
            }
        }
        if (allGranted) {
            request.grant(request.getResources());
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
        if (pendingMediaRequest != null) pendingMediaRequest.deny();
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
