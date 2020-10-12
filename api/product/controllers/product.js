'use strict'

const { sanitizeEntity } = require('strapi-utils')

module.exports = {
  async find(ctx) {
    let entities
    if (ctx.query._q) {
      entities = await strapi.services.product.search(ctx.query)
    } else {
      entities = await strapi.services.product.find(ctx.query)
    }

    return entities.map(entity => {
      const product = sanitizeEntity(entity, {
        model: strapi.models.product,
      });
      
      if (product.hasOwnProperty('source_product')) {
        delete product.source_product
      }

      return product

    })

  },
}