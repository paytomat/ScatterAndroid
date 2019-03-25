package com.mariabeyrak.scatterintegration;

import android.util.Log;
import android.webkit.ValueCallback;
import android.webkit.WebView;

import com.google.gson.Gson;
import com.mariabeyrak.scatterintegration.models.MethodName;
import com.mariabeyrak.scatterintegration.models.ResponseCodeInfo;
import com.mariabeyrak.scatterintegration.models.ScatterResponse;
import com.mariabeyrak.scatterintegration.models.core.key.PrivateKey;
import com.mariabeyrak.scatterintegration.models.core.signature.Signature;
import com.mariabeyrak.scatterintegration.models.requests.MsgTransaction.MsgTransactionRequestParams;
import com.mariabeyrak.scatterintegration.models.requests.Transaction.request.TransactionRequestParams;
import com.mariabeyrak.scatterintegration.models.requests.Transaction.response.ReturnedFields;
import com.mariabeyrak.scatterintegration.models.requests.Transaction.response.SignData;
import com.mariabeyrak.scatterintegration.models.requests.Transaction.response.TransactionResponseData;
import com.mariabeyrak.scatterintegration.util.EosUtils;

import org.bouncycastle.util.encoders.Hex;

import static com.mariabeyrak.scatterintegration.models.MethodName.REQUEST_SIGNATURE;

final class ScatterService {
    private static String TAG = "<<SS";
    final static private Gson gson = new Gson();

    private ScatterService() {
    }

    static void getEosAccount(final WebView webView, ScatterClient scatterClient) {
        ScatterClient.AccountReceived accountReceived = new ScatterClient.AccountReceived() {
            @Override
            public void onAccountReceivedSuccessCallback(String accountName) {
                sendSuccessScript(webView, MethodName.GET_EOS_ACCOUNT, gson.toJson(accountName));
            }

            @Override
            public void onAccountReceivedErrorCallback(Error error) {
            }
        };

        scatterClient.getAccount(accountReceived);
    }

    static void requestSignature(String data, final WebView webView, ScatterClient scatterClient) {
        final TransactionRequestParams transactionRequestParams = gson.fromJson(data, TransactionRequestParams.class);

        ScatterClient.TransactionCompleted transactionCompleted = new ScatterClient.TransactionCompleted() {
            @Override
            public void onTransactionCompletedSuccessCallback(String key) {
                String[] signatures = transactionRequestParams.toEosTransaction(new PrivateKey(key)).getPackedTx().getSignatures();
                sendSuccessScript(webView, MethodName.REQUEST_SIGNATURE,
                        gson.toJson(new TransactionResponseData(new SignData(signatures, new ReturnedFields()))));
            }

            @Override
            public void onTransactionCompletedErrorCallback(Error error) {
                sendErrorScript(webView, REQUEST_SIGNATURE);
            }
        };

        scatterClient.completeTransaction(transactionRequestParams, transactionCompleted);
    }

    static void requestMsgSignature(String data, final WebView webView, ScatterClient scatterClient) {
        final MsgTransactionRequestParams msgTransactionRequestParams = gson.fromJson(data, MsgTransactionRequestParams.class);

        ScatterClient.TransactionCompleted msgTransactionCompleted = new ScatterClient.TransactionCompleted() {
            @Override
            public void onTransactionCompletedSuccessCallback(String key) {
                final Signature signature = EosUtils.signTransactionRaw(Hex.decode(msgTransactionRequestParams.getData()), new PrivateKey(key));
                sendSuccessScript(webView, MethodName.REQUEST_MSG_SIGNATURE, gson.toJson(signature.toString()));
            }

            @Override
            public void onTransactionCompletedErrorCallback(Error error) {
                sendErrorScript(webView, MethodName.REQUEST_MSG_SIGNATURE);
            }
        };

        scatterClient.completeMsgTransaction(msgTransactionRequestParams, msgTransactionCompleted);
    }

    private static void sendSuccessScript(WebView webView, @MethodName.Methods String methodName, String responseData) {
        injectJs(webView, new ScatterResponse(methodName, ResponseCodeInfo.SUCCESS, responseData).formatResponse());
    }

    private static void sendErrorScript(WebView webView, @MethodName.Methods String methodName) {
        injectJs(webView, new ScatterResponse(methodName, ResponseCodeInfo.ERROR, "\"\"").formatResponse());
    }

    static void injectJs(final WebView webView, final String script) {
        webView.post(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(script, new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        Log.d(TAG, "onReceiveValue: " + value);
                    }
                });
            }
        });
    }
}
