import sys
import json
import os
from PIL import Image
import time
#perform image subtraction
# os.system('python3 -m pip3 install {}'.format('joblib'))
import numpy as np
import joblib #to load AI model
import cv2 #for thresholding
import matplotlib.pyplot as plt


if __name__ == '__main__':
    im1 = Image.open(sys.argv[1]).convert('L') #convert('L') is turn pic in grayscale
    im2 = Image.open(sys.argv[2]).convert('L') #convert('L') is turn pic in grayscale

    # Make into Numpy arrays
    im1np = np.array(im1)
    im2np = np.array(im2)

    # XOR with Numpy
    im_result = np.bitwise_xor(im1np, im2np).astype(np.uint8)

    # Apply thresholding with a threshold value of 127
    thresh_value = 40
    max_value = 255
    thresh_img = cv2.threshold(im_result, thresh_value, max_value, cv2.THRESH_BINARY)[1]

    #chop thresholding image into same size
    # Convert the numpy array to image file
    image = Image.fromarray(thresh_img)

    # Define the size of the sub-images
    sub_image_size = (100, 100)

    # Generate the sub-images, and store inside array
    images_list = []
    for i in range(image.width // sub_image_size[0] + 1):
        for j in range(image.height // sub_image_size[1] + 1):
            # Compute the coordinates of the upper-left corner of the sub-image
            x = i * sub_image_size[0]
            y = j * sub_image_size[1]

            # Compute the coordinates of the lower-right corner of the sub-image
            x1 = min(x + sub_image_size[0], image.width)
            y1 = min(y + sub_image_size[1], image.height)

            # Extract the sub-image using the crop() method
            sub_image = image.crop((x, y, x1, y1))

            # Create a new image with the fixed size of 100x100 pixels, (0,0,0) is black
            new_image = Image.new('RGB', sub_image_size, (0, 0, 0))

            # Paste the sub-image onto the new image
            new_image.paste(sub_image, ((sub_image_size[0]-sub_image.width)//2, (sub_image_size[1]-sub_image.height)//2))

            # Save the sub-image inside array list
            new_image = np.array(new_image)
            new_image_2d = np.mean(new_image, axis=2)
            images_list.append(new_image_2d)

    #turn 3d array into 2d array
    X = np.array(images_list)
    new_X = X.reshape(X.shape[0], (X.shape[1]*X.shape[2]))

    #DTmodel
    #code for load AI model
    dt_model = joblib.load('DTmodel_ver_5.sav')
    result = dt_model.predict(new_X)

    #summarise and convert result
    def defect(npArray):
        npArray = list(set(npArray)) #convert to set is remove all duplicate element, and convert to list
        if len(npArray) > 1:
            npArray.remove(1)  # Remove the element 1(No defect) from the list
    
        # Define a dictionary that maps values to defects status
        defects_dict = {0: 'Missing Hole', 1:'No defects', 2:'In cosistence Hole Size'}

        # Create a new tuple with values replaced by defect status
        final_result = list(defects_dict.get(x, x) for x in npArray)
        # print(final_result)
        return final_result

    DT_R = defect(result)

    #combine all defects into 1 string
    predict_string = ', '.join(str(x) for x in DT_R)
    # send output message to Node.js
    message = predict_string
    
    # encode the JSON data as base64
    encoded_data = json.dumps(message).encode('utf-8')
    sys.stdout.buffer.write(encoded_data)