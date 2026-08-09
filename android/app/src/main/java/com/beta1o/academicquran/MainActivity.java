package com.beta1o.academicquran;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * التحليل اللغوي المجهري — نفس موقع الويب (dist/index.html، ملف واحد قائم
 * بذاته يضم كل CSS/JS) مُحزَّمًا كأصل تطبيق ومحمَّلًا مباشرة عبر
 * file:///android_asset/، دون أي خادم مضمَّن — الموقع نفسه لا يحتاج واحدًا
 * (لا استدعاءات خلفية سوى تلاوة القرآن عبر quranapi.pages.dev، وهي طلبات
 * HTTPS عادية تعمل من WebView كما تعمل من أي متصفح).
 */
public class MainActivity extends Activity {

    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);   // localStorage: لوحة المدير، اللغة، الوضع الداكن، تقدّم الإجابات
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        // الأوراق تحوي جداول وشارات صغيرة (علامات الآيات، شارات المستوى) — يسمح
        // بتكبير/تصغير بإيماءتين دون أزرار تكبير عائمة تغطي الواجهة
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);

        web.setBackgroundColor(0xFFFBF8F0);

        // حوارات JS مخصّصة: الإعداد الافتراضي يُظهر عنوان "الصفحة على
        // file:///android_asset/... تقول" — هذه تستبدله بحوار نظيف بعلامة
        // التطبيق فقط، دون كشف المسار الداخلي (تُستخدم في لوحة المدير:
        // تأكيد الحذف/التراجع، ورسائل كلمة المرور الخاطئة)
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onJsAlert(WebView v, String url, String message, JsResult result) {
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle(getString(R.string.app_name))
                        .setMessage(message)
                        .setCancelable(false)
                        .setPositiveButton(android.R.string.ok, (d, w) -> result.confirm())
                        .setOnCancelListener(d -> result.cancel())
                        .show();
                return true;
            }
            @Override
            public boolean onJsConfirm(WebView v, String url, String message, JsResult result) {
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle(getString(R.string.app_name))
                        .setMessage(message)
                        .setCancelable(false)
                        .setPositiveButton(android.R.string.ok, (d, w) -> result.confirm())
                        .setNegativeButton(android.R.string.cancel, (d, w) -> result.cancel())
                        .setOnCancelListener(d -> result.cancel())
                        .show();
                return true;
            }
        });
        web.setWebViewClient(new WebViewClient() {   // يبقي كل التنقل داخل التطبيق
            @Override
            public boolean onRenderProcessGone(WebView view,
                    android.webkit.RenderProcessGoneDetail detail) {
                // إن انهارت عملية WebView (نفاد ذاكرة ونحوه) يُعاد بناء النشاط
                // بالكامل بدل تجمّد التطبيق على شاشة ميتة
                recreate();
                return true;
            }
        });

        setContentView(web);

        if (savedInstanceState != null) {
            web.restoreState(savedInstanceState);
        } else {
            web.loadUrl("file:///android_asset/www/index.html");
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            ((android.view.ViewGroup) web.getParent()).removeView(web);
            web.destroy();
        }
        super.onDestroy();
    }
}
