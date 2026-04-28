import torch
import tensorflow as tf
import os

def verify():
    print("--- Hardware Verification ---")
    
    # PyTorch
    pytorch_gpu = torch.cuda.is_available()
    print(f"PyTorch GPU: {'Available (' + torch.cuda.get_device_name(0) + ')' if pytorch_gpu else 'Not Available'}")
    
    # TensorFlow
    gpu_devices = tf.config.list_physical_devices('GPU')
    print(f"TensorFlow GPU: {'Available (' + str(len(gpu_devices)) + ' devices)' if gpu_devices else 'Not Available'}")
    
    # TPU
    tpu_address = os.environ.get('COLAB_TPU_ADDR')
    print(f"TPU: {'Available at ' + tpu_address if tpu_address else 'Not Available'}")
    
    print("-----------------------------")

if __name__ == "__main__":
    verify()
