import tensorflow as tf

class SpreadLSTM:
    """LSTM model for predicting spread probabilities."""

    def __init__(self, timesteps, features):
        self.timesteps = timesteps
        self.features = features
        self.device = "/GPU:0" if tf.config.list_physical_devices("GPU") else "/CPU:0"
        self.model = self.build_model()

    def build_model(self):
        """Build and compile the LSTM model."""
        with tf.device(self.device):
            model = tf.keras.Sequential([
                tf.keras.layers.Input(shape=(self.timesteps, self.features)),
                tf.keras.layers.LSTM(50),
                tf.keras.layers.Dense(1, activation='sigmoid')
            ])
            model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        return model

    def train(self, X, y, epochs=10, batch_size=32, validation_split=0.2):
        """Train the model using the provided data."""
        with tf.device(self.device):
            history = self.model.fit(X, y, epochs=epochs, batch_size=batch_size,
                                    validation_split=validation_split)
        return history

    def predict(self, X):
        """Predict probabilities for the given input."""
        with tf.device(self.device):
            return self.model.predict(X)

    @staticmethod
    def load(path: str):
        """Load a previously saved Keras model."""
        return tf.keras.models.load_model(path)
