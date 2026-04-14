import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
import matplotlib.pyplot as plt

DATA_DIR = '../datasets/PlantVillage' 
MODEL_DIR = '../models'
GRAPH_DIR = '../graphs'
SYNTHETIC_DIR = '../datasets/SyntheticPlantVillage'

def generate_synthetic_data(num_samples=100):
    print("Kaggle Dataset not found. Generating synthetic leaf data to demonstrate CNN model and accuracy graphs...")
    os.makedirs(SYNTHETIC_DIR, exist_ok=True)
    classes = ['Apple_Scab', 'Apple_Healthy', 'Tomato_Blight', 'Tomato_Healthy']
    
    for cls in classes:
        os.makedirs(os.path.join(SYNTHETIC_DIR, cls), exist_ok=True)
        for i in range(num_samples // len(classes)):
            # Generate random noisy images roughly resembling leaves (greenish)
            img = np.random.randint(0, 100, (224, 224, 3), dtype=np.uint8)
            img[:, :, 1] += 100 # Add green
            if "Healthy" not in cls:
                # Add "disease" spots (brown/yellow)
                img[100:150, 100:150, 0] = 200 # Red hue for spot
                img[100:150, 100:150, 1] = 150 # Green hue for spot
            img_path = os.path.join(SYNTHETIC_DIR, cls, f'synthetic_{i}.jpg')
            tf.keras.utils.save_img(img_path, img)

def build_model(num_classes):
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    for layer in base_model.layers:
        layer.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    predictions = Dense(num_classes, activation='softmax')(x)

    return Model(inputs=base_model.input, outputs=predictions)

def plot_training_history(history):
    os.makedirs(GRAPH_DIR, exist_ok=True)
    
    # Accuracy Graph
    plt.figure(figsize=(10, 5))
    plt.plot(history.history['accuracy'], label='Training Accuracy', color='green')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy', color='blue')
    plt.title('CNN Disease Detection Accuracy')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.grid(True)
    plt.savefig(os.path.join(GRAPH_DIR, 'disease_cnn_accuracy.png'))
    plt.close()

    # Loss Graph
    plt.figure(figsize=(10, 5))
    plt.plot(history.history['loss'], label='Training Loss', color='red')
    plt.plot(history.history['val_loss'], label='Validation Loss', color='orange')
    plt.title('CNN Disease Detection Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True)
    plt.savefig(os.path.join(GRAPH_DIR, 'disease_cnn_loss.png'))
    plt.close()
    
    print(f"Training accuracy and loss graphs saved to {GRAPH_DIR}")

def train():
    target_dir = DATA_DIR
    if not os.path.exists(DATA_DIR) or len(os.listdir(DATA_DIR)) == 0:
        generate_synthetic_data(400)
        target_dir = SYNTHETIC_DIR

    datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )

    train_generator = datagen.flow_from_directory(
        target_dir,
        target_size=(224, 224),
        batch_size=16,
        class_mode='categorical',
        subset='training'
    )

    val_generator = datagen.flow_from_directory(
        target_dir,
        target_size=(224, 224),
        batch_size=16,
        class_mode='categorical',
        subset='validation'
    )

    model = build_model(num_classes=train_generator.num_classes)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    print("Training CNN Model for Disease Detection...")
    history = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=10
    )

    os.makedirs(MODEL_DIR, exist_ok=True)
    model.save(os.path.join(MODEL_DIR, 'disease_cnn_model.keras'))
    
    plot_training_history(history)

if __name__ == "__main__":
    train()
