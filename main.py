from flask import Flask, jsonify, request
from TTS.api import TTS

app = Flask(__name__)

device = "cpu"

# if torch.backends.mps.is_available():
#     device = "mps"
# elif torch.cuda.is_available():
#     device = "cuda"


@app.route('/')
def index():
    return jsonify({"status": "ok"}), 200

@app.route('/tts', methods=['POST'])
def tts():
    data = request.get_json()
    text = data.get('text')
    model = data.get('model')
    speaker = data.get('speaker')
    output = data.get('output')

    try:
        tts = TTS(model_name=model).to(device)
        tts.tts_to_file(text=text, file_path=output, speaker=speaker)
        return jsonify({"status": "success", "output": output}), 200
    except Exception as e:
        print(f"Error generating speech: {e}")
        return jsonify({"status": "error", "output": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5500)
