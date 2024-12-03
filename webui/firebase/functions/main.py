from typing import Any
from firebase_functions import https_fn
from firebase_admin import initialize_app, firestore
import subprocess
import traceback
import json
import uuid

from firebase_functions import options, logger

from firebase_functions.firestore_fn import (
    on_document_created,
    Event,
    DocumentSnapshot,

)


# from lm_eval import evaluator

initialize_app()
db = firestore.client()


@https_fn.on_call()
def call_eval(req: https_fn.CallableRequest) -> Any:
    args = [
        ('--model', req.data['model']),
        ('--apply_chat_template', req.data.get('apply_chat_template', None)), # either present or not
        ('--limit', req.data.get('limit', None)), #needs to be an int or float between 0 and 1
        ('--model_args', req.data['model_args']),
        ('--tasks', ",".join(req.data['tasks'])),
        ('--num_fewshot', req.data.get('num_fewshot', None)),
        ('--gen_kwargs', req.data.get('gen_kwargs', None)),
        ('--output_path', req.data.get('output_path', None)), # TODO disable as CLI arg- set to `/output` then return results.json when it's done
        ('--log_samples', req.data.get('log_samples', None)), # either present or not
        ('--use_cache', req.data.get('use_cache', None)), # is a path
        ('--decontamination_ngrams_path', req.data.get('decontamination_ngrams_path', None)),
        ('--check_integrity', req.data.get('check_integrity', None)), # present or not
        ('--write_out', req.data.get('write_out', None)),
        ('--show_config', req.data.get('show_config', None)), #present or not
        ('--include_path', req.data.get('include_path', None)),
    ]

    # Filter out the arguments that are not provided in the request
    filtered_args = [(arg, value) for arg, value in args if value is not None]
    flat_and_filtered_args = [item for sublist in filtered_args for item in sublist]
    # Define the local completions URL

    userId = req.data['userId']
    docId= str(uuid.uuid4())
    doc_ref = db.collection('users').document(userId).collection('evals').document(docId)
    doc_ref.set({
        'status': 'creating job',
        'created': firestore.SERVER_TIMESTAMP,
        'args': flat_and_filtered_args
    })

    return {'ticket': docId}


@on_document_created(document='users/{userId}/evals/{docId}',
                     timeout_sec=539, # 9 minute limit, but 60 minute if http https://firebase.google.com/docs/functions/version-comparison
                     memory=options.MemoryOption.GB_4, #.MB_512,
                     cpu=4)
def execute_me(event: Event[DocumentSnapshot]):
    flat_and_filtered_args = [a for a in event.data.to_dict()['args'] if a != '']
    docId = event.params['docId']
    userId = event.params['userId']


    logger.log("execute_me called, docId: " + docId)

    try:
        docRef = db.collection('users').document(userId).collection('evals').document(docId)
        docRef.update({
            'status': 'running'
        })
        filename = f'/tmp/output/{uuid.uuid4()}.json'
        cmd = ['lm_eval'] + flat_and_filtered_args + ["--output_path", filename]
        logger.log(f"cmd: {cmd}")
        # Execute the command and capture the output and error
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE,
                                   stderr=subprocess.PIPE,
                                   universal_newlines=True)
        stdout, stderr = process.communicate()

        if process.returncode != 0:

            docRef.update({'status': 'error',
                           'error': f"Error running the tool: {stderr}"})

            return {"error": f"Error running the tool: {stderr}"}



        with open(filename, 'r') as json_file:
            data_dict = json.load(json_file)

        docRef.update({"status": "success", "data": data_dict})

    except Exception as e:
        # Capture the exception and format the stack trace
        error_message = str(e)
        traceback_info = traceback.format_exc()
        logger.log(f"{docId} trace: {traceback_info}")
        logger.log(f"{docId} error: {error_message}")
        docRef.update({'status': 'error',
                       'error': error_message,
                       'stack_trace': traceback_info})

