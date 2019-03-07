
goog.provide('inappEvents');

goog.require('sdkConfig');
goog.require('utils');
goog.require('http');

class InappEvents {
    constructor(airbridge) {
        this.airbridge = airbridge;
    }

    /**
     * 커스텀 목표 달성 인앱이벤트를 보낸다.
     * @param category {String} 인앱이벤트 카테고리
     * @param options {Object}
     */
    send(category, options) {
        this.airbridge.__sendWebEvent({
            "eventCategory": eventCategory['goal__web'],
            "goal": {
                category: category,
                label: options.label,
                action: options.action,
                value: options.value,
                semanticAttributes: options.semanticAttributes,
                customAttributes: options.customAttributes
            }
        });
    }

    signIn(options = {}) {
        if (options.userEmail) this.airbridge.setUserEmail(options.userEmail);
        if (options.userId) this.airbridge.setUserId(options.userId);
        this.send('airbridge.user.signin', options);
    }

    signUp(options = {}) {
        if (options.userEmail) this.airbridge.setUserEmail(options.userEmail);
        if (options.userId) this.airbridge.setUserId(options.userId);
        this.send('airbridge.user.signup', options);
    }

    signOut(){
      this.airbridge.setUserId("");
      this.airbridge.setUserEmail("");
      this.send('airbridge.user.signout', {});
    }
    
    purchased(options = {}) {
        const event = {
            customAttributes: {},
            semanticAttributes: {},
        };
        if (options.products) event.semanticAttributes.products = options.products;
        if (options.transactionId) event.semanticAttributes.transactionID = options.transactionId;
        if (options.inAppPurchased) event.semanticAttributes.inAppPurchased = options.inAppPurchased;
        if (options.totalValue) event.value = options.totalValue;
        if (options.currency) event.customAttributes.currency = options.currency;

        this.send('airbridge.ecommerce.order.completed', event);
    }

    addedToCart(options = {}) {
        const event = {
            customAttributes: {},
            semanticAttributes: {},
        };
        if (options.products) event.semanticAttributes.products = options.products;
        if (options.cartId) event.semanticAttributes.cartId = options.cartId;
        if (options.totalValue) event.value = options.totalValue;
        if (options.currency) event.customAttributes.currency = options.currency;

        this.send('airbridge.ecommerce.product.addedToCart', event);
    }

    productDetailsViewEvent(options = {}) {
        const event = {
          customAttributes: {},
          semanticAttributes: {},
        };
        if(options.products) event.semanticAttributes.products = options.products;

        this.send('airbridge.ecommerce.product.viewed', event);
    }

    homeViewEvent(options = {}) {
       const event = {
          customAttributes: {},
          semanticAttributes: {},
       }

       this.send('airbridge.ecommerce.home.viewed', event);
    }

    productListViewEvent(options = {}) {
      const event = {
        customAttributes: {},
        semanticAttributes: {},
      }
      if (options.products) event.semanticAttributes.products = options.products;
      if (options.productListID) event.semanticAttributes.productListID = options.productListID;

      this.send('airbridge.ecommerce.productList.viewed', event);
    }

    searchResultViewEvent(options = {}) {
      const event = {
        customAttributes: {},
        semanticAttributes: {},
      }
      if (options.product) event.semanticAttributes.products = options.products;
      if (options.query) event.semanticAttributes.query = options.query;

      this.send('airbridge.ecommerce.searchResults.viewed', event);
    }
}
