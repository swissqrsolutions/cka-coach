package com.swissqr.ckacoach;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import org.json.JSONObject;

/** CKA Coach: the guide (web app) below, Killercoda's real terminal on top, in one screen. */
public class MainActivity extends Activity {
  static final String APP = "https://swissqrsolutions.github.io/cka-coach/";
  WebView term, guide;
  LinearLayout root, bar;
  float split = 0.55f; // share of the screen for the terminal

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setBackgroundColor(Color.parseColor("#0c1220"));
    term = web(); guide = web();
    CookieManager.getInstance().setAcceptThirdPartyCookies(term, true);

    bar = new LinearLayout(this); bar.setGravity(Gravity.CENTER_VERTICAL); bar.setBackgroundColor(Color.parseColor("#1c2a4a")); bar.setPadding(16, 0, 8, 0);
    TextView grip = new TextView(this); grip.setText("═  drag  ═"); grip.setTextColor(Color.parseColor("#9aa6bd")); grip.setLayoutParams(new LinearLayout.LayoutParams(0, -1, 1)); grip.setGravity(Gravity.CENTER_VERTICAL);
    bar.addView(grip);
    bar.addView(btn("Paste", v -> pasteToTerminal(clip())));
    bar.addView(btn("Hide", v -> showTerminal(false)));
    bar.setOnTouchListener((v, e) -> { if (e.getAction() == MotionEvent.ACTION_MOVE) { split = Math.max(0.2f, Math.min(0.85f, e.getRawY() / root.getHeight())); layout(); } return true; });

    root.addView(term); root.addView(bar); root.addView(guide);
    setContentView(root);
    guide.addJavascriptInterface(new Bridge(), "CKANative");
    guide.loadUrl(APP);
    showTerminal(false);
  }

  WebView web() {
    WebView w = new WebView(this);
    WebSettings s = w.getSettings();
    s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true);
    s.setUserAgentString(s.getUserAgentString().replace("; wv", "")); // look like normal Chrome so sign-in works
    w.setWebViewClient(new WebViewClient());
    w.setWebChromeClient(new WebChromeClient());
    return w;
  }

  Button btn(String t, View.OnClickListener l) { Button x = new Button(this); x.setText(t); x.setAllCaps(false); x.setOnClickListener(l); return x; }

  void layout() {
    int h = root.getHeight(); if (h == 0) { root.post(this::layout); return; }
    int barH = (int) (48 * getResources().getDisplayMetrics().density);
    boolean on = term.getVisibility() == View.VISIBLE;
    int t = on ? (int) ((h - barH) * split) : 0;
    term.setLayoutParams(new LinearLayout.LayoutParams(-1, t));
    bar.setLayoutParams(new LinearLayout.LayoutParams(-1, on ? barH : 0));
    guide.setLayoutParams(new LinearLayout.LayoutParams(-1, h - t - (on ? barH : 0)));
  }

  void showTerminal(boolean on) { term.setVisibility(on ? View.VISIBLE : View.GONE); bar.setVisibility(on ? View.VISIBLE : View.GONE); layout(); }

  String clip() { ClipboardManager cm = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE); ClipData c = cm.getPrimaryClip(); return c != null && c.getItemCount() > 0 ? String.valueOf(c.getItemAt(0).coerceToText(this)) : ""; }

  /** Types text into the Killercoda terminal by sending a paste event to xterm; falls back to the clipboard. */
  void pasteToTerminal(String text) {
    String js = "(function(t){var ta=document.querySelector('.xterm-helper-textarea');if(!ta){var f=document.querySelectorAll('iframe');for(var i=0;i<f.length;i++){try{ta=f[i].contentDocument.querySelector('.xterm-helper-textarea');if(ta)break;}catch(e){}}}"
      + "if(!ta)return 'none';ta.focus();var d=new DataTransfer();d.setData('text/plain',t);ta.dispatchEvent(new ClipboardEvent('paste',{clipboardData:d,bubbles:true,cancelable:true}));return 'ok';})(" + JSONObject.quote(text) + ")";
    term.evaluateJavascript(js, r -> { if (!"\"ok\"".equals(r)) guide.evaluateJavascript("window.CKAToast&&CKAToast('Copied. Long-press the terminal and tap Paste.')", null); });
  }

  class Bridge {
    @JavascriptInterface public void openTerminal(String url) { runOnUiThread(() -> { if (term.getUrl() == null) term.loadUrl(url); showTerminal(true); }); }
    @JavascriptInterface public void run(String cmd) { runOnUiThread(() -> { copy(cmd); showTerminal(true); pasteToTerminal(cmd); }); }
    @JavascriptInterface public void copy(String t) { ((ClipboardManager) getSystemService(CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("cmd", t)); }
    @JavascriptInterface public void openBrowser(String url) { runOnUiThread(() -> startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)))); }
  }

  @Override public void onBackPressed() { if (guide.canGoBack()) guide.goBack(); else super.onBackPressed(); }
  @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); layout(); }
}
