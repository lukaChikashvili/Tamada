export const serializeTamadaData = (tamada, wishlisted = false) => {
    return {
      ...tamada,
      price: tamada.price ? parseFloat(tamada.price.toString()) : 0,
      createdAt: tamada.createdAt?.toISOString(),
      updatedAt: tamada.updatedAt?.toISOString(),
      wishlisted: wishlisted,
    };
  };