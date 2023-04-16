# import sys
# import json
# import io
# import base64
# from PIL import Image
# import time

print('python script is running')
# if __name__ == '__main__':
#     file1 = sys.argv[1]
#     file2 = sys.argv[2]
#     with Image.open(file2) as im:
#         im = im.convert('L') # convert to grayscale
#         pixel_values = list(im.getdata())
#         width, height = im.size
#         pixel_values = [pixel_values[i:i+width] for i in range(0, len(pixel_values), width)]
#         data = {'width': width, 'height': height, 'pixels': pixel_values}
#         # json_data = json.dumps(data)
#         print('\nfile1 width and height: {0} and {1}' .format(width, height))
    
#     # process the first image...
    
#     # process the second image...

#     time.sleep(20) #imagine whole process AI is 20 second
#     #Assume the defects result
#     predict_arr = [0, 1, 1, 3, 4, 5]
#     predict_set = set(predict_arr) #turn to set, so alr element is unique
#     if 0 in predict_set and len(predict_set) > 1: 
#         predict_set.remove(0) #if 0 is exist && length.set > 1 (mean have other defect), remove 0(No defect)

#     predict_string = ' '.join(str(x) for x in predict_set)
#     # send output message to Node.js
#     message = {'message': predict_string}
    
#     # encode the JSON data as base64
#     encoded_data = json.dumps(message).encode('utf-8')
#     sys.stdout.buffer.write(encoded_data)
    # print('python script is finished')