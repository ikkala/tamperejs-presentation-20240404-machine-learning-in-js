TampereJS - 20240404

https://www.reddit.com/r/MachineLearning/comments/179uwbq/d_tensorflowjs_and_state_of_the_ecosystem_for/
https://huggingface.co/spaces/hysts/mediapipe-pose-estimation
https://blog.tensorflow.org/2020/05/how-hugging-face-achieved-2x-performance-boost-question-answering.html
https://golb.hplar.ch/2019/01/machine-learning-with-brain-and-tensorflow-js.html

https://www.geeksforgeeks.org/machine-learning-frameworks/

https://www.datacamp.com/blog/top-ai-frameworks-and-libraries

https://medium.com/@pierrerouhard/reinforcement-learning-in-the-browser-an-introduction-to-tensorflow-js-9a02b143c099


Initial plan for slides (to be rendered as pdf):

- Opening demo as a teaser:
    - Posenet based Tensorflow.js demo
        https://storage.googleapis.com/tfjs-models/demos/pose-detection/index.html?model=posenet
    - How is this done, is it easy to do, is it cloud-service or what, how much is it costing?
        - Is it cloud-service, what's the cost: This is local, costs nothing, it's open source too!
        - How and is it easy: Let's see in this presentation
            - The presentation is about encouraging, cheering on, to use ready made building blocks

- Machine learning - What? Why the fuss?
    - Wikipedia: "Machine learning (ML) is a field of study in artificial intelligence concerned with the development and study of statistical algorithms that can _learn_ from data and _generalize to unseen data_, and thus perform tasks without explicit instructions."
    - "Recently, artificial neural networks (part of ML) have been _able to surpass many previous approaches in performance_."

- Learning and Inferring
    - In machine learning there's typically two phases: Learning and Inferring
        - image: https://www.researchgate.net/figure/Overview-of-training-and-inference-in-deep-learning_fig1_330842645
    - In "Supervised learning" and "Unsupervised learning" the learning phase is done
      just during developing of the system, and the results (machine learning "models"), that system has learned,
      is used for inferring in the final system
        - Supervised: We give example scenarios and desired end result
        - Unsupervised: We let the machine learn itself what kind of data it is dealing with.
          It might find "clusters" of data by categorizing the data like images
          to classes that we haven't defined beforehand
    - In "Reinforcement learning" the learning is done also in the final system so that system
      learns during the execution, from its dynamic environment, by interacting with the end users, etc.
    - There are also machine learning that is something outside of the above, or something
      that combines the above, or is in between some of the above
    - It's very very wild-wild west! :D

- Ruling techs in the world of Machine Learning at the beginning of 2024
    - Python rulez, especially in the "learning" side, in making new innovation
        - perhaps a bit harsh generalization but I'm not here to argue about that :)
    - Three big "forces" at 2024: Tensorflow, PyTorch and Huggingface
        - (For example, if you google, you might end up finding lists that contain for example Microsoft Cognitive Toolkit (CNTK) is basically deprecated: https://stackoverflow.com/a/55845017)
        - They implement the learning and inferring of the models and dictate in which format models are stored
        - Their have practices how to share also the pre-trained models ("hubs", "model zoos")
    (Show them:)
    - Tensorflow
        - https://www.tensorflow.org/
        - Sharing models: https://www.tensorflow.org/hub, https://tfhub.dev/ => https://www.kaggle.com/models?tfhub-redirect=true
        - and more
    - PyTorch
        - https://pytorch.org/
        - Sharing models: https://pytorch.org/hub/
        - and more
    - Huggingface
        - Originally concentrated to Natural Language Processing (NLP) but nowadays also image and speech
        - Utilizes Tensorflow and PyTorch to provide higher level abstraction libs
            - Though, Tensorflow and PyTorch provide also those higher level libs!
        - Sharing models: https://huggingface.co/models
        - Sharing datasets: https://huggingface.co/datasets
        - Provides also execution as cloud-service (like OpenAI)
            - Serverless Inference API https://huggingface.co/docs/api-inference/en/index
            - huggingface.js

- From theory to practice, please?
    - (Show posenet demo again, and: Back to the opening question: Ok, ok, but how the demo is this done, is easy to do?)
    - The theory behind all this can be very complicated, and as described earlier, very heterogeneous,
      developing the machine learning itself forward definitely requires its specialists
    - You can google them but quite easily you end up to some mickey-mouse demo
        that tells you "tensors" and "neural networks" and how to teach them to "learn"
        but you migth be unsure if and how you apply those in real-life problems
    - But how about just regular software developers
        - doing applications for people,
        - knowing software development practices well,
        - but not having knowledge, time and desire to know all from bottom to top?
    - How and what we can apply right now to our software easily?
    - Easy to use, batteries-included, libs and tools?
    - Let's narrow down to the "infere" phase and skip the "learn" part because it seems to be laborious? :D

- Low-hanging fruits
    - For,
        - face / pose detection, in real time
        - natural language processing (NLP)
        - image description
    - For JavaScript ecosystem devs!
    - Let's select two: Tensorflow.js, and Huggingface Transformers.js

- Tensorflow.js, in high level
    - a JavaScript library for training and deploying machine learning models in the browser and on Node.js
    - utilizes WebGL for hardware-accelerated graphics in web browsers (also in mobile!)
    - on Node.js, accelerated by the TensorFlow C binary, runs tensor operations on the GPU with CUDA :(
    - part of the broader TensorFlow ecosystem, an open-source platform for machine learning created by Google
        - The TensorFlow (without .js) is based on C++ and Python, CUDA and cuDNN for GPU acceleration
    - Has also higher level libs that they confusingly call "models": https://www.tensorflow.org/js/models
        - But very good that they provide those!
        - in Tensorflow.js, "model" refers not just to the underlying mathematical model,
        but to the entire package that includes the pre-trained weights, the architecture,
        and the high-level functions for processing inputs and interpreting outputs.
        This package effectively becomes a plug-and-play component for developers.
            - https://github.com/tensorflow/tfjs-models

- Huggingface Transformers.js
    - Transformers.js uses ONNX Runtime to run models in the browser
    - "you can easily convert your pretrained PyTorch, TensorFlow, or JAX models to ONNX"
    - Models for Transformers.js: https://huggingface.co/models?library=transformers.js&sort=trending
    - The WebGPU support coming in version 3 (in alpha now)
        - https://cloudblogs.microsoft.com/opensource/2024/02/29/onnx-runtime-web-unleashes-generative-ai-in-the-browser-using-webgpu/

- (Show posenet demo again, and: Back to the opening question: Ok, ok, but how the demo is this done, is easy to do?)

- Demos
