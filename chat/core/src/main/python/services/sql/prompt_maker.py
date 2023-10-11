# -*- coding:utf-8 -*-
import os
import sys
from typing import List, Mapping

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from util.logging_utils import logger

from langchain.prompts import PromptTemplate
from langchain.prompts.few_shot import FewShotPromptTemplate
from langchain.prompts.example_selector import SemanticSimilarityExampleSelector


def schema_linking_exampler(
    user_query: str,
    domain_name: str,
    fields_list: List[str],
    prior_schema_links: Mapping[str, str],
    example_selector: SemanticSimilarityExampleSelector,
) -> str:

    prior_schema_links_str = (
        "["
        + ",".join(["""'{}'->{}""".format(k, v) for k, v in prior_schema_links.items()])
        + "]"
    )

    example_prompt_template = PromptTemplate(
        input_variables=[
            "table_name",
            "fields_list",
            "prior_schema_links",
            "question",
            "analysis",
            "schema_links",
        ],
        template="Table {table_name}, columns = {fields_list}, prior_schema_links = {prior_schema_links}\nQuestion:{question}\nanalysis:{analysis} So Schema_links are:\nSchema_links:{schema_links}",

    )

    instruction = "# According to the table structure of the database and referring to a priori information, find out the schema_links that generate SQL query statements for each question."

    schema_linking_prompt = "Table {table_name}, columns = {fields_list}, prior_schema_links = {prior_schema_links}\nQuestion:{question}\nAnalysis: Let us think step by step."

    schema_linking_example_prompt_template = FewShotPromptTemplate(
        example_selector=example_selector,
        example_prompt=example_prompt_template,
        example_separator="\n\n",
        prefix=instruction,
        input_variables=["table_name", "fields_list", "prior_schema_links", "question"],
        suffix=schema_linking_prompt,
    )

    schema_linking_example_prompt = schema_linking_example_prompt_template.format(
        table_name=domain_name,
        fields_list=fields_list,
        prior_schema_links=prior_schema_links_str,
        question=user_query,
    )

    return schema_linking_example_prompt


def sql_exampler(
    user_query: str,
    domain_name: str,
    schema_link_str: str,
    data_date: str,
    example_selector: SemanticSimilarityExampleSelector,
) -> str:

    instruction = "# Generate SQL query statements for each question based on schema links"

    sql_example_prompt_template = PromptTemplate(
        input_variables=[
            "question",
            "current_date",
            "table_name",
            "schema_links",
            "sql",
        ],
        template="Question:{question}\nCurrent_date:{current_date}\nTable {table_name}\nSchema_links:{schema_links}\nSQL:{sql}",
    )

    sql_prompt = "Question:{question}\nCurrent_date:{current_date}\nTable {table_name}\nSchema_links:{schema_links}\nSQL:"

    sql_example_prompt_template = FewShotPromptTemplate(
        example_selector=example_selector,
        example_prompt=sql_example_prompt_template,
        example_separator="\n\n",
        prefix=instruction,
        input_variables=["question", "current_date", "table_name", "schema_links"],
        suffix=sql_prompt,
    )

    sql_example_prompt = sql_example_prompt_template.format(
        question=user_query,
        current_date=data_date,
        table_name=domain_name,
        schema_links=schema_link_str,
    )

    return sql_example_prompt


def schema_linking_sql_combo_examplar(
    user_query: str,
    domain_name: str,
    data_date: str,
    fields_list: List[str],
    prior_schema_links: Mapping[str, str],
    example_selector: SemanticSimilarityExampleSelector,
) -> str:

    prior_schema_links_str = (
        "["
        + ",".join(["""'{}'->{}""".format(k, v) for k, v in prior_schema_links.items()])
        + "]"
    )

    example_prompt_template = PromptTemplate(
        input_variables=[
            "table_name",
            "fields_list",
            "prior_schema_links",
            "current_date",
            "question",
            "analysis",
            "schema_links",
            "sql",
        ],
        template="Table {table_name}, columns = {fields_list}, prior_schema_links = {prior_schema_links}\nCurrent_date:{current_date}\nQuestion:{question}\nAnalysis:{analysis} So Schema_links is:\nSchema_links:{schema_links}\nSQL:{ sql}",
    )

    instruction = (
        "# According to the table structure of the database and with reference to a priori information, find out the schema_links that generate SQL query statements for each question, and then generate SQL query statements for each question based on the schema_links."
    )

    schema_linking_sql_combo_prompt = "Table {table_name}, columns = {fields_list}, prior_schema_links = {prior_schema_links}\nCurrent_date:{current_date}\nQuestion:{question}\nAnalysis: Let us think step by step."

    schema_linking_sql_combo_example_prompt_template = FewShotPromptTemplate(
        example_selector=example_selector,
        example_prompt=example_prompt_template,
        example_separator="\n\n",
        prefix=instruction,
        input_variables=[
            "table_name",
            "fields_list",
            "prior_schema_links",
            "current_date",
            "question",
        ],
        suffix=schema_linking_sql_combo_prompt,
    )

    schema_linking_sql_combo_example_prompt = (
        schema_linking_sql_combo_example_prompt_template.format(
            table_name=domain_name,
            fields_list=fields_list,
            prior_schema_links=prior_schema_links_str,
            current_date=data_date,
            question=user_query,
        )
    )
    return schema_linking_sql_combo_example_prompt
