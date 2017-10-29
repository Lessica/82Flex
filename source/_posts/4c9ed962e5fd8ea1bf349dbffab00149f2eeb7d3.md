---
title: 啊咧？顺序表
categories: C
tags: [c,数据结构]
date: 2015-10-22 12:58:00
---

``` c
#include <stdio.h>
#include <stdlib.h>

#define MAXLEN 100

typedef struct {
    int data[MAXLEN];
    int length;
} Seqlist;

void seqCreate(Seqlist *L);
void seqSort(Seqlist *L);
void seqFind(Seqlist *L);
void seqDisp(Seqlist *L);
void seqInsert(Seqlist *L);
void seqDel(Seqlist *L);

int main(int argc, char *argv[]) {
    Seqlist L;
    L.length = 0;
    
    seqCreate(&L);
    seqSort(&L);
    seqDisp(&L);
    seqFind(&L);
    seqInsert(&L); // Insert a number to a position
    seqDisp(&L);
    seqSort(&L); // Sort it again
    seqDisp(&L);
    seqDel(&L); // Delete an element
    seqDisp(&L);
    return 0;
}

void seqCreate(Seqlist *L) {
    int total_num;
    printf("Enter the total amount: ");
    scanf("%d", &total_num);
    while (total_num-- && L->length < MAXLEN) {
        printf("Element %d: ", L->length + 1);
        scanf("%d", &L->data[L->length++]);
    }
}

int seqCompare(const void *a, const void *b) {
    return (*(int *)a - *(int *)b);
}

void seqSort(Seqlist *L) {
    qsort(L->data, L->length, sizeof(L->data[0]), &seqCompare);
}

void seqDisp(Seqlist *L) {
    int i;
    printf("List: ");
    for (i = 0; i < L->length; i++)
        printf("%d, ", L->data[i]);
    printf("\n");
}

void seqFind(Seqlist *L) {
    int x, i;
    printf("Enter the target number: ");
    scanf("%d", &x);
    for (i = 0; i < L->length; i++)
        if (L->data[i] == x) break;
    printf("Target number %d is at the position %d of the list.\n", x, i + 1);
}

void seqInsert(Seqlist *L) {
    if (L->length + 1 > MAXLEN) {
        printf("The list is full.");
        return;
    }
    int i, p, t, r, x;
    printf("Enter the target position: ");
    scanf("%d", &p);
    if (p <= 0 || p > L->length) {
        printf("Invalid position.\n");
        return;
    }
    printf("Enter the number: ");
    scanf("%d", &x);
    for (i = p - 1, t = L->data[i], L->data[i] = x; i < L->length; i++) {
        r = t;
        t = L->data[i + 1];
        L->data[i + 1] = r;
    }
    L->length++;
}

void seqDel(Seqlist *L) {
    if (L->length <= 0) {
        printf("The list is empty.\n");
        return;
    }
    int i, p;
    printf("Enter the target position: ");
    scanf("%d", &p);
    if (p <= 0 || p > L->length) {
        printf("Invalid position.\n");
        return;
    }
    for (i = p; i < L->length; i++) {
        L->data[i - 1] = L->data[i];
    }
    L->length--;
}
```

# 升级版

``` c
#include <stdio.h>
#include <stdlib.h>
#include <malloc.h>
#include <string.h>

#define lengthStep 16

struct ArrayList {
    int* data;
    int num;
    int length;
};

void InitArrayList(ArrayList *anArrayList) {
    anArrayList->num = 0;
    anArrayList->length = lengthStep;
    anArrayList->data = (int *)malloc(lengthStep * sizeof(int));
    if (anArrayList->data == NULL) {
        printf("Allocation failed!\n");
        return;
    }
}

void ExpandArrayList(ArrayList *anArrayList) {
    if (anArrayList == NULL) {
        printf("Init ArrayList first!\n");
        return;
    }
    int *newArea = (int *)malloc((anArrayList->length + lengthStep) * sizeof(int));
    if (newArea == NULL) {
        printf("Allocation failed!\n");
        return;
    }
    memcpy(newArea, anArrayList->data, anArrayList->num * sizeof(int));
    anArrayList->length += lengthStep;
    printf("ArrayList has been expanded, and now its size is: %d.\n", anArrayList->length);
    free(anArrayList->data);
    anArrayList->data = newArea;
}

int CheckArrayList(ArrayList *anArrayList, int index) {
    if (anArrayList == NULL) {
        printf("Init ArrayList first!\n");
        return 0;
    }
    if (index >= anArrayList->num || index < 0) {
        printf("Index out of bounds [0..%d]\n", anArrayList->num);
        return 0;
    }
    return 1;
}

int ValueAtIndex(ArrayList *anArrayList, int index) {
    if (!CheckArrayList(anArrayList, index)) {
        return -1;
    }
    return anArrayList->data[index];
}

void AddValue(ArrayList *anArrayList, int value) {
    if (anArrayList == NULL) {
        printf("Init ArrayList first!\n");
        return;
    }
    if (anArrayList->num >= anArrayList->length) {
        ExpandArrayList(anArrayList);
    }
    anArrayList->data[anArrayList->num] = value;
    anArrayList->num++;
}

void InsertValueAtIndex(ArrayList *anArrayList, int index, int value) {
    if (!CheckArrayList(anArrayList, index)) {
        return;
    }
    if (anArrayList->num >= anArrayList->length) {
        ExpandArrayList(anArrayList);
    }
    for (int i = anArrayList->num; i > index; i--) {
        anArrayList->data[i] = anArrayList->data[i - 1];
    }
    anArrayList->data[index] = value;
    anArrayList->num++;
}

void SetValueAtIndex(ArrayList *anArrayList, int index, int value) {
    if (!CheckArrayList(anArrayList, index)) {
        return;
    }
    anArrayList->data[index] = value;
}

void DeleteValueAtIndex(ArrayList *anArrayList, int index) {
    if (!CheckArrayList(anArrayList, index)) {
        return;
    }
    for (int i = index + 1; i < anArrayList->num; i++) {
        anArrayList->data[i - 1] = anArrayList->data[i];
    }
    anArrayList->num--;
}

void DeleteAllValues(ArrayList *anArrayList) {
    anArrayList->num = 0;
}

void PrintAllValues(ArrayList *anArrayList) {
    printf("[");
    for (int i = 0; i < anArrayList -> num; i++) {
	    printf("%d", anArrayList->data[i]);
	    if (i != anArrayList->num - 1) {
	        printf(", ");
	    }
	}
	printf("]\n");
}

void FreeArrayList(ArrayList *anArrayList) {
    anArrayList->num = 0;
    anArrayList->length = 0;
    free(anArrayList->data);
}

int main(void) { 
	ArrayList a;
	
	InitArrayList(&a);
	PrintAllValues(&a);
	
	for (int i = 0; i < 10; i++) {
	    AddValue(&a, i);
	}
	PrintAllValues(&a);
	
	DeleteValueAtIndex(&a, 2);
	PrintAllValues(&a);
	
	InsertValueAtIndex(&a, 2, 9);
	PrintAllValues(&a);
	
	DeleteAllValues(&a);
	PrintAllValues(&a);
	
	FreeArrayList(&a);
	
	return 0;
}
```
