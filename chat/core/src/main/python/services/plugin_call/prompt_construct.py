# -*- coding:utf-8 -*-
import json
import os
import re
import sys
from typing import Any, List, Mapping, Union

from util.logging_utils import logger

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


def construct_plugin_prompt(tool_config):
    tool_name = tool_config["name"]
    tool_description = tool_config["description"]
    tool_examples = tool_config["examples"]

    prompt = "【Tool name】\n" + tool_name + "\n"
    prompt += "【Tool description】\n" + tool_description + "\n"

    prompt += "【Examples of tool application issues】\n"
    for example in tool_examples:
        prompt += example + "\n"
    return prompt


def construct_plugin_pool_prompt(tool_config_list):
    tool_explain_list = []
    for tool_config in tool_config_list:
        tool_explain = construct_plugin_prompt(tool_config)
        tool_explain_list.append(tool_explain)

    tool_explain_list_str = "\n\n".join(tool_explain_list)

    return tool_explain_list_str


def construct_task_prompt(query_text, tool_explain_list_str):
    instruction = """The question is: {query_text}\nPlease select the corresponding tool according to the description of the problem and tool to complete the task. Please note that only 1 tool can be selected. Please analyze the reasons for selecting the tool step by step (the [Tool Applicable Question Example] of each tool is an important reference for selection), and give the final selection. The output format is json, and the key is 'Analysis Process', 'Selection Tool'""".format(
        query_text=query_text
    )

    prompt = "Tool selection is as follows:\n\n{tool explain list str}\n\n【Task Description】\n{instruction}".format(
        instruction=instruction, tool_explain_list_str=tool_explain_list_str
    )

    return prompt


def plugin_selection_output_parse(llm_output: str) -> Union[Mapping[str, str], None]:
    try:
        pattern = r"\{[^{}]+\}"
        find_result = re.findall(pattern, llm_output)
        result = find_result[0].strip()

        logger.info("result: {}", result)

        result_dict = json.loads(result)
        logger.info("result_dict: {}", result_dict)

        key_mapping = {"Analysis process": "analysis", "Selection tool": "toolSelection"}

        converted_result_dict = {
            key_mapping[key]: value
            for key, value in result_dict.items()
            if key in key_mapping
        }

    except Exception as e:
        logger.exception(e)
        converted_result_dict = None

    return converted_result_dict


def plugins_config_format_convert(
    plugin_config_list: List[Mapping[str, Any]]
) -> List[Mapping[str, Any]]:
    plugin_config_list_new = []
    for plugin_config in plugin_config_list:
        plugin_config_new = dict()
        name = plugin_config["name"]
        description = plugin_config["description"]
        examples = plugin_config["examples"]
        parameters = plugin_config["parameters"]

        examples_str = "\n".join(examples)
        description_new = """{plugin_desc}\n\nFor example, it can handle the following problems:\n{examples_str}""".format(
            plugin_desc=description, examples_str=examples_str
        )

        plugin_config_new["name"] = name
        plugin_config_new["description"] = description_new
        plugin_config_new["parameters"] = parameters

        plugin_config_list_new.append(plugin_config_new)

    return plugin_config_list_new
